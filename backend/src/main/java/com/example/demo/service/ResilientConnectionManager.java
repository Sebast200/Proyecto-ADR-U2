package com.example.demo.service;

import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.util.concurrent.*;

@Component
public class ResilientConnectionManager {

    // Configuración de la base de datos LOCAL (Docker PostgreSQL - db_replica)
    private static final String DB_URL = "jdbc:postgresql://db_replica:5432/postgres";
    private static final String DB_USER = "postgres";
    private static final String DB_PASSWORD = "example";

    public Connection getConnection() throws SQLException {
        Properties props = new Properties();
        props.setProperty("user", DB_USER);
        props.setProperty("password", DB_PASSWORD);
        props.setProperty("connectTimeout", "5"); // segundos
        props.setProperty("socketTimeout", "5");

        System.out.println("➡ Intentando conexión con base de datos local...");

        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<Connection> future = executor.submit(() -> DriverManager.getConnection(DB_URL, props));

        try {
            // Espera máximo 5 segundos para la conexión
            Connection conn = future.get(5, TimeUnit.SECONDS);
            System.out.println("✅ Conexión a BD local establecida correctamente.");
            return conn;
        } catch (TimeoutException e) {
            future.cancel(true);
            System.err.println("⏱️ Conexión a BD local excedió 5s, abortando.");
            throw new SQLException("Timeout de conexión con BD local (5s).");
        } catch (Exception e) {
            System.err.println("❌ Error al conectar con BD local: " + e.getMessage());
            throw new SQLException("Error al conectar con BD local: " + e.getMessage());
        } finally {
            executor.shutdownNow();
        }
    }
}
