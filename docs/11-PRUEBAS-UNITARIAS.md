# Guía: pruebas unitarias (backend) — estado, cómo hacerlas y cómo mostrarlas

Este documento describe **qué hay cubierto hoy**, **cómo escribir** nuevas pruebas unitarias en el backend Spring Boot, y **cómo ejecutarlas y presentarlas** (terminal, IDE, reportes, demos).

Para levantar API + front + Postgres en local, seguí [docs/10-GUIA-PRUEBAS-LOCALES.md](10-GUIA-PRUEBAS-LOCALES.md).

---

## 1. ¿Ya están todas las pruebas unitarias?

**No.** En el backend hay **dos capas** de pruebas automáticas mezcladas en `mvn test`:

| Tipo | Qué son | Clases actuales |
|------|---------|-----------------|
| **Unitarias** | No levantan Spring completo; dependencias **mockeadas** (Mockito). Rápidas. | `AuthServiceTest`, `JwtServiceTest` |
| **Integración / arranque** | Levantan el contexto Spring, MockMvc, JPA + H2 (`application-test.yml`). Más lentas. | `AuthControllerIntegrationTest`, `CanchasApplicationTests` |

**Servicios de dominio** que aún **no** tienen clase `*Test` unitaria dedicada (buen backlog ordenado por impacto):

- `ReservationService`
- `AvailabilityService`
- `ReportService`
- `AuditService`
- `AdminCourtService`, `AdminUserService`, `AdminPaymentService`, `AdminAuditService`

El **frontend** (React + Vite) **no** tiene runner de tests unitarios configurado en `package.json`; si más adelante se añade, lo habitual es **Vitest** + **React Testing Library**.

---

## 2. Herramientas y ubicación en el repo

- **JUnit 5** (`@Test`, `@BeforeEach`, …)
- **Mockito** (`@Mock`, `@ExtendWith(MockitoExtension.class)`, `when`, `verify`, `ArgumentCaptor`)
- **AssertJ** (`assertThat`, `assertThatThrownBy`) — viene con `spring-boot-starter-test`
- **Código bajo prueba:** `backend/src/main/java/...`
- **Tests:** `backend/src/test/java/...` (misma jerarquía de paquetes que `main`)

Ejemplo de referencia:

- Servicio + mocks: `backend/src/test/java/com/canchas/auth/service/AuthServiceTest.java`
- Clase sin Spring, instancia real: `backend/src/test/java/com/canchas/security/JwtServiceTest.java`

---

## 3. Cómo escribir una prueba unitaria de un servicio

### 3.1 Patrón recomendado (Mockito puro)

1. Anotá la clase con `@ExtendWith(MockitoExtension.class)`.
2. Declaré `@Mock` para cada dependencia inyectada en el constructor del servicio (repositorios, `JwtService`, `PasswordEncoder`, `Environment`, etc.).
3. En `@BeforeEach`, construí el servicio con `new MiServicio(mock1, mock2, ...)`.
4. En cada `@Test`: configurá `when(...).thenReturn(...)` o `thenThrow(...)`, llamá al método público, y afirmá con AssertJ; usá `verify(mock).metodo(...)` cuando importe comprobar efectos secundarios (por ejemplo que se llamó a `save`).

Evitá `@SpringBootTest` en tests que pretendan ser **solo unitarios**; si aparece el banner de Spring Boot al correr un test, es integración.

### 3.2 Nombres de tests

Convención legible: `metodoOComportamiento_condicion_resultadoEsperado`, por ejemplo `login_wrongPassword_incrementsFailedCount`.

### 3.3 Entidades JPA sin setters públicos

Algunas entidades (por ejemplo `User`) no exponen `setId()`. En tests unitarios podés:

- Confiar en lo que devuelve `repository.save` si el código bajo prueba asigna el id en otro lado, o
- Asignar el id con **reflexión** en el test (como en `AuthServiceTest`) si el flujo necesita un `UUID` fijo para assertions sobre el token o el DTO.

### 3.4 Qué no conviene forzar como “unit” puro

Filtros HTTP, `SecurityFilterChain`, controladores con validación completa del stack: suelen ir mejor a **`@WebMvcTest`** o tests de **integración** con MockMvc (como `AuthControllerIntegrationTest`).

---

## 4. Cómo ejecutarlas

Desde el directorio `backend/`:

| Objetivo | Comando |
|----------|---------|
| Todos los tests (unitarios + integración) | `mvn test` |
| Una sola clase | `mvn test -Dtest=AuthServiceTest` |
| Un solo método | `mvn test -Dtest=AuthServiceTest#login_throwsWhenUserNotFound` |

En Windows PowerShell los argumentos con `#` a veces requieren comillas: `mvn test "-Dtest=AuthServiceTest#login_throwsWhenUserNotFound"`.

---

## 5. Cómo ver y guardar resultados (para vos o para un PR)

### 5.1 Salida en consola

`mvn test` al final muestra un resumen: tests ejecutados, fallos, errores, skipped. Eso alcanza para CI y para adjuntar en un comentario de PR.

### 5.2 Reportes Surefire (por clase)

Tras `mvn test`:

- Ruta: `backend/target/surefire-reports/`
- Por cada clase: un `.txt` (legible) y un `.xml` (para herramientas / Jenkins / GitHub Actions)

Sirven para **adjuntar evidencia** en un ticket o en la descripción de un merge request.

### 5.3 IDE (Cursor / VS Code / IntelliJ)

- Abrí la vista de **Testing** / JUnit.
- Podés ejecutar solo `AuthServiceTest` o solo `JwtServiceTest` para una **demo rápida** sin esperar el arranque completo de Spring.

### 5.4 Cómo “presentarlas” según audiencia

| Audiencia | Qué mostrar |
|-----------|-------------|
| **Equipo técnico** | `mvn test` en verde, o captura del panel de tests del IDE; en PR, enlace al job de CI. |
| **Producto / no código** | Tabla corta: *Escenario* → *Qué evita que falle* → *Tipo* (unitaria / integración); opcional: una captura del final de `mvn test`. |
| **Defensa académica o informe** | Listado de casos de prueba alineados con requisitos, más los archivos `.txt` de Surefire o el log de CI. |

---

## 6. JDK reciente y Mockito (Byte Buddy)

En entornos con **JDK muy nuevo** (por ejemplo 25), Mockito puede fallar al crear mocks con un mensaje de Byte Buddy sobre versiones no soportadas. El proyecto define en `backend/pom.xml` la opción JVM:

`-Dnet.bytebuddy.experimental=true`

en el plugin **maven-surefire-plugin**, para que los tests sigan corriendo. Cuando las dependencias alineen soporte oficial, se puede **revisar** si esa opción sigue siendo necesaria.

---

## 7. Relación con otras guías

- Pruebas manuales y entorno local: [docs/10-GUIA-PRUEBAS-LOCALES.md](10-GUIA-PRUEBAS-LOCALES.md)
- API con Postman: [docs/09-GUIA-POSTMAN-BACKEND.md](09-GUIA-POSTMAN-BACKEND.md)
- Contratos HTTP: [docs/05-API-Y-CONTRATOS.md](05-API-Y-CONTRATOS.md)

---

## 8. Checklist al agregar tests nuevos

1. ¿Es lógica pura con dependencias inyectables? → Unit test con Mockito.
2. ¿Necesitás HTTP + validación + seguridad real? → `@WebMvcTest` o test de integración existente.
3. ¿Necesitás SQL y repositorios reales? → `@DataJpaTest` o integración con H2 (perfil `test`).
4. Corré `mvn test` antes de subir cambios.
5. Si el PR es para no técnicos, dejá una línea en la descripción enlazando escenarios de negocio a los nombres de los métodos `@Test`.
