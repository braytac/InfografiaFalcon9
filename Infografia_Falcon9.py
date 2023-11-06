#!/usr/bin/env python
# coding: utf-8

# In[1]:


from bs4 import BeautifulSoup
import requests
import re
import json
from datetime import datetime

# Si leo desde archivo local
#with open("falcon.html", "r", encoding="utf-8") as file:
#    content = file.read()
url = "https://en.wikipedia.org/wiki/List_of_Falcon_9_and_Falcon_Heavy_launches"
print("Leyendo tablas de "+url+"...")
# Obteniendo datos de algún sitio web en lugar de local
response = requests.get(url)
content = response.content

# Crear obj chusmear el contenido HTML
soup = BeautifulSoup(content, "html.parser")

# Voy a mirar td de estas tables
tables = soup.find_all("table", class_="wikitable")

# Diccionarios para almacenar la mitad de los nodos raíz en panel izquierdo y
# la otra en derecho (hasta conseguir info de "en servicio" o fuera de servicio
data = {"LR": {}, "RL": {}}
print("Buscando referencias...")
# Iterar sobre cada tabla
for table in tables:
    rows = table.find_all("tr")

    # La mitad de la totalidad de filas
    half_length = len(rows) // 2

    # Iterar sobre cada tr (salvo la 1ra, que tiene los encabezados)
    for i, row in enumerate(rows[1:], start=1):
        # los td de cada tr
        cells = row.find_all("td")

        try:
            # Fecha de primer <td>
            date_string = cells[0].text.split("\n")[0]
            date_string = re.sub(r"\[\d+\]", "", date_string)  # Eliminar strings adicionales que no me interesan

            # Veo si fiene facha de fecha, si no omito esta fila (tal vez mejorar eso, 
            # hay excepciones en wiki
            match = re.search(r"(\d{1,2})\s*(\w+)\s*(\d{4}).*", date_string)
            if not match:
                continue

            day = match.group(1)
            month_word = match.group(2)
            year = match.group(3)

            month = {
                "January": "01", "February": "02", "March": "03", "April": "04", "May": "05", "June": "06",
                "July": "07", "August": "08", "September": "09", "October": "10", "November": "11", "December": "12"
            }.get(month_word)

            if not month:
                continue

            # Quiero fecha en "dd/mm/yyyy"
            formatted_date = f"{day.zfill(2)}/{month}/{year}"

            # Versión SN y versión del booster del 2do <a> del 2do <td>
            node_label = cells[1].find_all("a")[1].text

            # Versión del booster después del pto.
            node_number = node_label.split(".")[1]

            # SN del booster antes del .
            node_key = node_label.split(".")[0]
            
            node_orbit = cells[5].find_all("a")[0].text[0:3]
            
            # Obtener el texto del primer <a> del 3er <td> como el lugar
            # parent_node_label = cells[2].find_all("a")[1].text
            node_lugar = cells[2].find_all("a")[1].text
            """
            parent_node_label = cells[0].find("a")
            if parent_node_label:
                parent_node_label = parent_node_label.text
            else:
                continue
            """
            # Agregar el nodo al panel lzquierdo "LR" si está en la primera mitad de las filas, cc/ agregarlo a "RL"
            if i <= half_length:
                panel = "LR";
            else:                
                panel = "RL";

            if node_key in data[panel]:
                data[panel][node_key]["datos"].append({"numero": node_number, "fecha": formatted_date, "lugar": node_lugar, "orbita":node_orbit})
            else:
                data[panel][node_key] = {"id": node_key, "datos": [{"numero": node_number, "fecha": formatted_date, "lugar": node_lugar, "orbita":node_orbit}]}

        except IndexError:
            # Si error (IndexError) => sigo
            continue

data["LR"] = list(data["LR"].values())
data["RL"] = list(data["RL"].values())

# Ordenar las fechas de menor a mayor para cada clave principal
print("Reordenando...")
for key in data:
    data[key] = sorted(data[key], key=lambda x: datetime.strptime(x["datos"][0]["fecha"], "%d/%m/%Y"))

print("Finalizado.")
# Convertir el diccionario a JSON
json_data = json.dumps(data, indent=2)
#print(json_data)
# guardo acá el json que deberá ir al lado del index.html
with open('data.json', 'w') as file:
    json.dump(data, file)

