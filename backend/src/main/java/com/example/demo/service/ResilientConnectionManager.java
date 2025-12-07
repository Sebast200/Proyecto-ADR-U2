package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.util.concurrent.*;

@Component
public class ResilientConnectionManager {

    // 🟢 Configuración local (db_replica)
    @Value("${spring.datasource.local.url}")
    private String localUrl;

    @Value("${spring.datasource.local.username}")
    private String localUser;

    @Value("${spring.datasource.local.password}")
    private String localPass;

    // ☁️ Configuración Supabase
    @Value("${spring.datasource.supabase.url}")
    private String supabaseUrl;

    @Value("${spring.datasource.supabase.username}")
    private String supabaseUser;

    @Value("${spring.datasource.supabase.password}")
    private String supabasePass;

    public Connection getConnection() throws SQLException {
        Properties props = new Properties();
        props.setProperty("user", localUser);
        props.setProperty("password", localPass);
        props.setProperty("connectTimeout", "5");
        props.setProperty("socketTimeout", "5");

        System.out.println("➡ Intentando conexión con base local (db_replica)...");

        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<Connection> future = executor.submit(() -> DriverManager.getConnection(localUrl, props));

        try {
            // Espera máximo 5 segundos por conexión local
            Connection conn = future.get(5, TimeUnit.SECONDS);
            System.out.println("✅ Conectado correctamente a db_replica.");
            return conn;

        } catch (Exception e) {
            future.cancel(true);
            System.err.println("⚠️ Error o timeout al conectar con db_replica: " + e.getMessage());
            System.out.println("➡ Intentando conexión con Supabase...");

            // Fallback a Supabase
            Properties sbProps = new Properties();
            sbProps.setProperty("user", supabaseUser);
            sbProps.setProperty("password", supabasePass);
            sbProps.setProperty("sslmode", "require");

            try {
                Connection supaConn = DriverManager.getConnection(supabaseUrl, sbProps);
                System.out.println("✅ Conectado correctamente a Supabase (modo fallback).");
                return supaConn;
            } catch (SQLException supaErr) {
                System.err.println("❌ Error al conectar con Supabase: " + supaErr.getMessage());
                throw new SQLException("No se pudo conectar ni a db_replica ni a Supabase.", supaErr);
            }
        } finally {
            executor.shutdownNow();
        }
    }
}
