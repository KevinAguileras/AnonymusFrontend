#!/usr/bin/env python3
"""Sube el inventario local a RDS usando la API del backend en 8081.

Uso:
  ADMIN_EMAIL='jo.prueba@duocuc.cl' ADMIN_PASSWORD='ClaveNueva123' \
    python3 scripts/migrar_inventario.py

Requiere: tunel SSH a RDS abierto y backend corriendo en 8081 con perfil aws.
El script es repetible: si la categoria o el producto ya existen, los omite.
"""
import json
import os
import urllib.error
import urllib.request
from pathlib import Path

BASE = os.environ.get("API_BASE", "http://127.0.0.1:8081/api/v1")
EMAIL = os.environ.get("ADMIN_EMAIL")
PASSWORD = os.environ.get("ADMIN_PASSWORD")

if not EMAIL or not PASSWORD:
    raise SystemExit("Faltan ADMIN_EMAIL o ADMIN_PASSWORD en el entorno.")


def pedir(method, path, body=None, token=None):
    datos = None if body is None else json.dumps(body).encode("utf-8")
    cabeceras = {"Accept": "application/json"}
    if body is not None:
        cabeceras["Content-Type"] = "application/json"
    if token:
        cabeceras["Authorization"] = "Bearer " + token
    peticion = urllib.request.Request(BASE + path, data=datos, headers=cabeceras, method=method)
    try:
        with urllib.request.urlopen(peticion, timeout=30) as respuesta:
            crudo = respuesta.read()
            return respuesta.status, json.loads(crudo) if crudo else None
    except urllib.error.HTTPError as error:
        crudo = error.read()
        try:
            detalle = json.loads(crudo)
        except Exception:
            detalle = crudo.decode("utf-8", "replace")
        return error.code, detalle


def indice_categorias(token):
    _, lista = pedir("GET", "/categorias", token=token)
    return {c["nombre"].strip().lower(): c["id"] for c in (lista or [])}


estado, sesion = pedir("POST", "/auth/login", {"email": EMAIL, "password": PASSWORD})
if estado != 200:
    raise SystemExit(f"No se pudo iniciar sesion ({estado}): {sesion}")

token = sesion["token"]
print(f"Sesion iniciada como {sesion.get('nombre')} ({sesion.get('rol')}).")

datos = json.loads(Path(__file__).with_name("inventario.json").read_text(encoding="utf-8"))

categorias = indice_categorias(token)
for nombre in datos["categorias"]:
    clave = nombre.lower()
    if clave in categorias:
        print(f"Categoria ya existe: {nombre}")
        continue
    estado, creada = pedir("POST", "/categorias", {"nombre": nombre}, token)
    if estado == 201:
        categorias[clave] = creada["id"]
        print(f"Categoria creada: {nombre}")
    elif estado == 409:
        categorias = indice_categorias(token)
        print(f"Categoria ya existe (conflicto): {nombre}")
    else:
        raise SystemExit(f"Error creando categoria {nombre}: {estado} {creada}")

_, actuales = pedir("GET", "/productos", token=token)
existentes = {p["nombre"].strip().lower() for p in (actuales or [])}

creados = 0
omitidos = 0
for producto in datos["productos"]:
    clave = producto["nombre"].strip().lower()
    if clave in existentes:
        print(f"Producto ya existe: {producto['nombre']}")
        omitidos += 1
        continue
    categoria_id = categorias.get(producto["categoria"].lower())
    if categoria_id is None:
        raise SystemExit(f"No se encontro categoria para {producto['nombre']}")
    cuerpo = {
        "nombre": producto["nombre"],
        "categoriaId": categoria_id,
        "precio": producto["precio"],
        "img": producto["img"],
        "oferta": producto.get("oferta", False),
        "precioAnterior": producto.get("precioAnterior"),
        "stock": producto.get("stock", 20),
    }
    estado, creado = pedir("POST", "/productos", cuerpo, token)
    if estado == 201:
        creados += 1
        print(f"Producto creado: {producto['nombre']}")
    else:
        raise SystemExit(f"Error creando {producto['nombre']}: {estado} {creado}")

print(f"Listo. Creados: {creados}. Omitidos: {omitidos}.")
