# Scraper Recetas

Una aplicación sencilla para obtener los datos más importantes de las recetas listadas en el blog de [Paulina Cocina](https://www.paulinacocina.net/). Funciona con la mayoría de las recetas; sin embargo, algunas páginas no tienen el mismo formato que el scraper asume como estándar.

Este proyecto fue construido con la intención de facilitar la tarea de obtener los datos para poblar la base de datos a mis compañeros de grupo de Programación Web, ya que lo importante del proyecto era hacer las entregas a tiempo y tener los datos bien organizados en la base de datos. Íbamos a invertir mucho tiempo en obtener todos los datos de internet manualmente.

El deploy está hecho en [Vercel](https://vercel.com). El cliente web está distribuído simplemente como una página estática, mientras que el backend está distribuído como una [Serverless Function](https://vercel.com/docs/functions/serverless-functions) según el formato requerido de acuerdo al mismo proveedor.
