# Documento de requerimientos: Sistema de venta de entradas de cine

**Fuente:** intercambio de mails con el cliente (01/01/2020 al 10/03/2020).
**Alcance:** un único edificio con varias salas; venta online de entradas y productos del candy bar, con panel de administración y validación por parte de empleados.

---

## 1. Roles

| Rol | Descripción | Puede |
|---|---|---|
| Anónimo | Visitante sin cuenta | Ver cartelera, próximamente y reseñas; comprar entradas y productos |
| Cliente registrado | Usuario con cuenta | Todo lo del anónimo + cupones, puntos, crédito, reseñas, alertas, "Mis películas", cancelar compras |
| Empleado | Personal del cine | Validar QR (sala y candy bar) escaneando o ingresando el código a mano |
| Administrador | Gestión del cine | Gestionar películas, funciones, salas, butacas, productos, combos, cupones, recompensas, preventa; ver reportes y log |

---

## 2. Requerimientos funcionales

### 2.1 Usuarios y registro
- **RF-01** Registro con: email, nombre, apellido, fecha de nacimiento, tipo de sangre, color de ojos y días de vacaciones por año.
- **RF-02** Inicio y cierre de sesión. Cada usuario tiene un rol (cliente, empleado, admin).
- **RF-03** La compra puede hacerse sin registrarse (anónimo).
- **RF-04** Beneficio por registrarse: cupón de descuento en la primera compra.

### 2.2 Películas
- **RF-05** Cada película tiene nombre, duración, imagen, sinopsis, uno o más géneros y restricción de edad (ninguna, +13 o +18).
- **RF-06** El admin decide qué películas aparecen en la página.
- **RF-07** La página principal muestra primero las 3 películas más vendidas.
- **RF-08** El listado de películas tiene buscador por nombre y filtro por género.
- **RF-09** Sección "Próximamente" con los estrenos de las próximas semanas.
- **RF-10** Los usuarios pueden activar una alerta para ser notificados cuando se abra la venta de una película de "Próximamente".

### 2.3 Salas y butacas
- **RF-11** Todas las salas tienen la misma distribución (ver sección 4.1).
- **RF-12** Butacas accesibles (filas J y K) y VIP (filas R, S y T) se distinguen visualmente de las comunes.
- **RF-13** Las butacas VIP tienen un precio mayor, y el usuario debe saber claramente que está comprando una butaca VIP antes de pagar.
- **RF-14** El mapa de butacas se actualiza en tiempo real: el usuario ve las butacas ocupadas por otras compras mientras elige.

### 2.4 Funciones
- **RF-15** Cada función tiene película, fecha y hora, formato (2D, 3D, 4D, 5D) e idioma (castellano o subtitulada).
- **RF-16** Entre el fin de una función y el inicio de la siguiente en la misma sala deben pasar al menos 30 minutos.
- **RF-17** Nunca puede haber dos funciones en la misma sala al mismo tiempo.
- **RF-18** El admin carga la película, los días y el horario (ej.: lunes, martes y viernes a las 18 h) y el sistema asigna la sala automáticamente.

### 2.5 Compra
- **RF-19** El usuario elige función, butacas y opcionalmente productos del candy bar o combos.
- **RF-20** Los combos (entrada + pochoclos + bebida a precio fijo) aparecen destacados en la página de compra.
- **RF-21** Al finalizar se genera un PDF con los datos de la compra y un QR.
- **RF-22** El mismo QR sirve para ingresar a la sala y para retirar los productos del candy bar.
- **RF-23** Las películas con restricción de edad: un usuario registrado menor a la edad requerida no puede comprar. Toda entrada de esas películas indica que debe asistir un adulto.

### 2.6 Descuentos, puntos y crédito
- **RF-24** El porcentaje del cupón de primera compra es configurable por el admin.
- **RF-25** El admin puede crear cupones exclusivos para usuarios mayores de 50 años.
- **RF-26** Programa de fidelización: el usuario registrado gana 1 punto por cada peso gastado.
- **RF-27** Los puntos se canjean por entradas o productos del candy bar; el admin configura el costo en puntos de cada recompensa.
- **RF-28** El perfil muestra los puntos acumulados y el historial de canjes. Los puntos no son transferibles.
- **RF-29** El usuario puede cancelar una compra hasta 2 horas antes de la función. No se devuelve dinero: se acredita saldo en la cuenta.
- **RF-30** El crédito se ve en el perfil y puede combinarse con otros medios de pago.

### 2.7 Preventa
- **RF-31** Por película, el admin puede abrir la venta 7 días antes del estreno con un precio especial de preventa.
- **RF-32** Pasada la fecha de preventa, el precio vuelve al normal.

### 2.8 Reseñas e historial
- **RF-33** Los usuarios califican películas con estrellas y dejan un comentario corto.
- **RF-34** Las reseñas y el promedio de puntuación se ven antes de comprar.
- **RF-35** Sección "Mis películas": historial visual con póster, fecha y la calificación propia.

### 2.9 Validación (empleados)
- **RF-36** El empleado escanea el QR o ingresa el código a mano.
- **RF-37** Una vez validada la entrada, ese QR ya no sirve para entrar. Una vez entregada la comida, ya no sirve para retirarla.

### 2.10 Administración y reportes
- **RF-38** ABM de películas, funciones, productos, categorías de productos, combos, cupones y recompensas.
- **RF-39** Reporte de facturación por día y cantidad de entradas vendidas.
- **RF-40** Exportación del reporte de facturación a PDF y a Excel.
- **RF-41** Gráficos: películas más vistas por semana y por mes; producto del candy bar más vendido.
- **RF-42** Log de actividad con fecha y hora: quién creó cada función, quién modificó precios, quién validó cada QR.

---

## 3. Requerimientos no funcionales

- **RNF-01** Estilo visual único y propio.
- **RNF-02** Interfaces fáciles de usar para clientes y empleados.
- **RNF-03** Ingreso de fechas y horas sin calendarios ni listas con mucho scroll.
- **RNF-04** Aplicación instalable (PWA).
- **RNF-05** Desplegada con URL pública; código en GitHub.
- **RNF-06** Tecnologías: Angular + Supabase (autenticación, base de datos, tiempo real).
- **RNF-07** La seguridad de los datos se aplica en el servidor (políticas RLS), no solo en la interfaz.

---

## 4. Ambigüedades detectadas y decisiones tomadas

### 4.1 Distribución de butacas
**Problema:** el primer mail dice 20 filas con letras y bloques de 4, 20 y 4 butacas (28 por fila). Después se "quitan" las filas J y K para "una fila" accesible con 2, 10 y 2 butacas, pero más adelante se habla de "filas J y K adaptadas". Además, las VIP son R, S y T: en el abecedario español (con Ñ) la T es la letra 21, por lo que 20 filas no llegarían a la T.

**Decisión:**
- Las filas se nombran **A a T sin la Ñ** (convención habitual de cines), lo que da exactamente 20 filas.
- **J y K se mantienen como filas accesibles**, cada una con 2 + 10 + 2 = 14 butacas.
- **R, S y T son VIP** (28 butacas cada una).
- Total por sala: 18 filas × 28 + 2 filas × 14 = **532 butacas**.
- El pedido de que el admin controle "la distribución de las butacas" se interpreta como poder **habilitar o deshabilitar butacas** (por ejemplo, rotas), sin cambiar la forma de la sala, que el cliente definió como fija.

### 4.2 Mapa del cine
El cliente lo menciona pero aclara que **no tiene luz verde**. **Queda fuera de alcance.**

### 4.3 Datos del registro
Tipo de sangre, color de ojos y días de vacaciones no tienen relación con el negocio, y el tipo de sangre es un **dato sensible de salud** según la Ley 25.326 de Protección de Datos Personales. **Decisión:** se recolectan porque el cliente los pide, pero el tipo de sangre es **opcional**. Se recomienda al cliente revisar este punto.

### 4.4 Pago
El cliente no especifica medio de pago ni pasarela. **Decisión:** el pago se **simula** (se registra la compra como pagada). Integrar una pasarela real queda fuera de alcance.

### 4.5 Precios
No se define cómo se calcula el precio de una entrada. **Decisión:** precio base configurable por formato (2D, 3D, 4D, 5D), recargo VIP configurable y precio de preventa por película.

### 4.6 Restricción de edad en compras anónimas
Solo se puede verificar la edad de usuarios registrados. **Decisión:** los registrados menores no pueden comprar; el comprador anónimo debe confirmar que asistirá un adulto, y la entrada lo indica. El control final se hace en la puerta.

### 4.7 Cupones
- Primera compra y mayores de 50 usan el mismo mecanismo de cupón con condiciones (primera compra, edad mínima).
- **Un cupón por compra.** Los cupones requieren estar registrado (hace falta conocer la edad y el historial).
- La edad para el cupón de +50 se calcula al momento de la compra.

### 4.8 Orden de aplicación de descuentos
No está definido. **Decisión:**
1. Precio base (preventa si corresponde, recargo VIP).
2. Combos a precio fijo (no acumulables con cupón).
3. Cupón porcentual sobre el resto.
4. Canje de puntos por ítems específicos (ese ítem pasa a costo 0).
5. Crédito en cuenta como medio de pago; el resto se paga por otro medio.

Los puntos se ganan sobre el **dinero efectivamente pagado** (no sobre crédito ni canjes), para que no se generen puntos de forma circular.

### 4.9 Cancelaciones
Se acredita lo pagado (incluido el crédito usado). Se liberan las butacas, se descuentan los puntos ganados por esa compra y el cupón usado **no** se restituye. No se puede cancelar una compra ya validada.

### 4.10 QR y validación
El QR es **uno por compra** y tiene dos estados independientes: entrada validada y candy entregado. Validar uno no invalida el otro. Si no hay productos, el candy bar lo rechaza.

### 4.11 Asignación automática de salas para varios días
**Decisión:** para cada fecha pedida, el sistema busca una sala libre respetando la duración + 30 minutos, priorizando la misma sala en todos los días. Si alguna fecha no tiene sala disponible, se informa al admin y esa fecha no se crea.

### 4.12 Top 3 más vendidas
**Decisión:** se calcula por entradas vendidas en los últimos 30 días, para que refleje la cartelera actual.

### 4.13 Reseñas y "Mis películas"
Solo usuarios registrados, una reseña por película (editable). "Mis películas" se basa en entradas **validadas** (lo que realmente vio), no solo compradas.

### 4.14 Alertas de "Próximamente"
**Decisión:** notificación dentro de la aplicación cuando se abre la venta; la notificación push de la PWA queda como mejora.

### 4.15 Formato e idioma
Se asignan a la **función**, no a la película: la misma película puede darse en 2D castellano y en 3D subtitulada.

---

## 5. Fuera de alcance
- Mapa del cine (sin aprobación del cliente).
- Pasarela de pago real.
- Devolución de dinero (el cliente pidió explícitamente solo crédito).
- Transferencia de puntos entre usuarios (prohibida por el cliente).

---

## 6. Plan de construcción
Primero el núcleo, después la periferia:

1. Registro, login, roles y rutas protegidas.
2. Películas, géneros, cartelera y buscador.
3. Funciones con validación de solapamiento y asignación automática de sala.
4. Mapa de butacas en tiempo real.
5. Compra, PDF y QR.
6. Validación por empleados.
7. Candy bar y combos.
8. Cupones, puntos, crédito y cancelaciones.
9. Preventa, próximamente y alertas.
10. Reseñas y "Mis películas".
11. Reportes, exportaciones, gráficos y log.
