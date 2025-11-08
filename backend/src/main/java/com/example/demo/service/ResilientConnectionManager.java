package com.example.demo.service;

import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.util.concurrent.*;

@Component
public class ResilientConnectionManager {

    private static final String SUPABASE_URL =
            "jdbc:postgresql://aws-1-us-east-2.pooler.supabase.com:6543/postgres";
    private static final String SUPABASE_USER = "postgres.jzqbadzevxvznbsxyecp";
    private static final String SUPABASE_PASSWORD = "Zevasti201.";

    public Connection getConnection() throws SQLException {
        Properties props = new Properties();
        props.setProperty("user", SUPABASE_USER);
        props.setProperty("password", SUPABASE_PASSWORD);
        props.setProperty("sslmode", "require");
        props.setProperty("connectTimeout", "3"); // segundos
        props.setProperty("socketTimeout", "3");

        System.out.println("➡ Intentando conexión rápida con Supabase (timeout total 4s)...");

        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<Connection> future = executor.submit(() -> DriverManager.getConnection(SUPABASE_URL, props));

        try {
            // Espera máximo 4 segundos para toda la conexión (DNS + SSL + socket)
            Connection conn = future.get(4, TimeUnit.SECONDS);
            System.out.println("✅ Conexión Supabase establecida rápidamente.");
            return conn;
        } catch (TimeoutException e) {
            future.cancel(true);
            System.err.println("⏱️ Conexión a Supabase excedió 4s, abortando.");
            throw new SQLException("Timeout de conexión con Supabase (4s).");
        } catch (Exception e) {
            System.err.println("❌ Error al conectar con Supabase: " + e.getMessage());
            throw new SQLException("Error al conectar con Supabase: " + e.getMessage());
        } finally {
            executor.shutdownNow();
        }
    }
}
