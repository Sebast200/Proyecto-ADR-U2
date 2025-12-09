package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;
import java.util.concurrent.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class ResilientConnectionManager {

    private static final Logger log = LoggerFactory.getLogger(ResilientConnectionManager.class);

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
    
    // Declaramos el ExecutorService fuera del try para que sea accesible en el finally
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    public Connection getConnection() throws SQLException {
        
        // 1. Configuración de la conexión local
        Properties props = new Properties();
        props.setProperty("user", localUser);
        props.setProperty("password", localPass);
        props.setProperty("connectTimeout", "5");
        props.setProperty("socketTimeout", "5");

        log.info("EVENT_DB:CONN_ATTEMPT - Attempting connection to local database (db_replica)...");

        // 2. Declaración explícita del Future y Callable para evitar Type Mismatch
        // Esto le indica explícitamente a Java que la operación devuelve una Connection.
        Callable<Connection> connectionTask = () -> DriverManager.getConnection(localUrl, props);
        Future<Connection> future = executor.submit(connectionTask);

        // 3. Declaración de propiedades de Supabase (accesibles en el fallback)
        Properties sbProps = new Properties();
        sbProps.setProperty("user", supabaseUser);
        sbProps.setProperty("password", supabasePass);
        sbProps.setProperty("sslmode", "require");


        try {
            // Espera máximo 5 segundos por conexión local
            Connection conn = future.get(5, TimeUnit.SECONDS);
            log.info("EVENT_DB:CONN_SUCCESS:LOCAL - Successfully connected to db_replica.");
            return conn;

        } catch (Exception e) {
            future.cancel(true);
            
            // 👈 LOG DE FALLO/TIMEOUT Y FALLBACK
            log.warn("EVENT_DB:CONN_TIMEOUT:LOCAL - Error or timeout connecting to db_replica: {}. Falling back to Supabase...", e.getMessage()); 

            // Fallback a Supabase
            try {
                Connection supaConn = DriverManager.getConnection(supabaseUrl, sbProps); // usa las variables declaradas arriba
                log.info("EVENT_DB:CONN_SUCCESS:FALLBACK - Successfully connected to Supabase (fallback mode).");
                return supaConn;
            } catch (SQLException supaErr) {
                // 👈 LOG DE FALLO CRÍTICO
                log.error("EVENT_DB:CONN_FAILED:CRITICAL - Failed to connect to Supabase: {}", supaErr.getMessage()); 
                throw new SQLException("No se pudo conectar ni a db_replica ni a Supabase.", supaErr);
            }
        } finally {
            // Asegura que el servicio Executor se cierre sin importar el resultado
            executor.shutdownNow(); 
        }
    }
}