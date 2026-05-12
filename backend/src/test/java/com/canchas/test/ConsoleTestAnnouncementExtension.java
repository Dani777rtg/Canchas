package com.canchas.test;

import org.junit.jupiter.api.extension.BeforeTestExecutionCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.annotation.AnnotatedElementUtils;

/**
 * Imprime en consola, en lenguaje natural, qué caso se está ejecutando.
 * Se registra globalmente mediante {@code META-INF/services/...} y
 * {@code junit.jupiter.extensions.autodetection.enabled=true} en {@code junit-platform.properties}.
 */
public class ConsoleTestAnnouncementExtension implements BeforeTestExecutionCallback {

    @Override
    public void beforeTestExecution(ExtensionContext context) {
        if (context.getTestMethod().isEmpty()) {
            return;
        }
        String className = context.getRequiredTestClass().getSimpleName();
        String caso = context.getDisplayName();
        String tipo = describeTestKind(context.getRequiredTestClass());
        System.out.println();
        System.out.println("================================================================================");
        System.out.println("  PRUEBA AUTOMATICA  |  " + className);
        System.out.println("  Tipo: " + tipo);
        System.out.println("  Caso: " + caso);
        System.out.println("================================================================================");
        System.out.flush();
    }

    /**
     * INTEGRACION si la clase (o su jerarquia / contenedora) usa anotaciones tipicas de tests Spring.
     * En caso contrario se asume UNITARIA (Mockito u otra prueba aislada).
     */
    static String describeTestKind(Class<?> testClass) {
        if (usesIntegrationAnnotations(testClass)) {
            return "INTEGRACION (Spring Boot: contexto, beans y a veces HTTP o JPA de prueba)";
        }
        return "UNITARIA (sin levantar Spring completo; dependencias simuladas o clase pura)";
    }

    private static boolean usesIntegrationAnnotations(Class<?> type) {
        if (type == null) {
            return false;
        }
        for (Class<?> c = type; c != null && c != Object.class; c = c.getSuperclass()) {
            if (hasSpringBootSliceAnnotation(c)) {
                return true;
            }
        }
        for (Class<?> c = type.getEnclosingClass(); c != null; c = c.getEnclosingClass()) {
            if (hasSpringBootSliceAnnotation(c)) {
                return true;
            }
        }
        return false;
    }

    private static boolean hasSpringBootSliceAnnotation(Class<?> c) {
        return AnnotatedElementUtils.hasAnnotation(c, SpringBootTest.class)
                || AnnotatedElementUtils.hasAnnotation(c, WebMvcTest.class)
                || AnnotatedElementUtils.hasAnnotation(c, DataJpaTest.class);
    }
}
