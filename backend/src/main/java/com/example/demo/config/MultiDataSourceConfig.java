package com.example.demo.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class MultiDataSourceConfig {

    // 🟢 Base de datos local (principal)
    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.local")
    public DataSourceProperties localDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "localDataSource")
    @Primary
    @ConfigurationProperties("spring.datasource.local.hikari")
    public DataSource localDataSource() {
        return localDataSourceProperties().initializeDataSourceBuilder().build();
    }

    // ☁️ Base de datos Supabase (fallback)
    @Bean
    @ConfigurationProperties("spring.datasource.supabase")
    public DataSourceProperties supabaseDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean(name = "supabaseDataSource")
    @ConfigurationProperties("spring.datasource.supabase.hikari")
    public DataSource supabaseDataSource() {
        return supabaseDataSourceProperties().initializeDataSourceBuilder().build();
    }
}
