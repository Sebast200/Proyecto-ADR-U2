import pg from "pg";

const localPool = new pg.Pool({
  connectionString: process.env.LOCAL_DB_URL,
});

const supabasePool = new pg.Pool({
  host: process.env.SUPABASE_URL,
  port: process.env.SUPABASE_PORT,
  user: process.env.SUPABASE_USER,
  password: process.env.SUPABASE_PASSWORD,
  database: process.env.SUPABASE_DB,
  ssl: { rejectUnauthorized: false },
});

console.log("=== [SYNCER] Sincronización local → Supabase iniciada ===");

// 🔹 Función genérica de sincronización para cualquier tabla
async function syncTable(tableName, columns, idColumn = "id") {
  const clientLocal = await localPool.connect();
  const clientSupabase = await supabasePool.connect();

  try {
    const colList = columns.join(", ");
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    const updateList = columns
      .filter((c) => c !== idColumn)
      .map((c) => `${c} = EXCLUDED.${c}`)
      .join(", ");

    const querySelect = `SELECT ${colList} FROM ${tableName} WHERE synced IS FALSE OR synced IS NULL;`;
    const res = await clientLocal.query(querySelect);

    if (res.rows.length === 0) {
      console.log(`[${tableName}] No hay filas nuevas.`);
      return;
    }

    console.log(`[${tableName}] ${res.rows.length} filas pendientes de sincronizar...`);

    for (const row of res.rows) {
      const values = columns.map((c) => row[c]);
      const queryInsert = `
        INSERT INTO ${tableName} (${colList})
        VALUES (${placeholders})
        ON CONFLICT (${idColumn}) DO UPDATE SET ${updateList};
      `;
      await clientSupabase.query(queryInsert, values);
      await clientLocal.query(`UPDATE ${tableName} SET synced = TRUE WHERE ${idColumn} = $1;`, [row[idColumn]]);
      console.log(`[${tableName}] → Registro ${row[idColumn]} sincronizado`);
    }
  } catch (err) {
    console.error(`❌ Error en tabla ${tableName}:`, err.message);
  } finally {
    clientLocal.release();
    clientSupabase.release();
  }
}

// 🔹 Bucle de sincronización (en orden de dependencias)
async function runSync() {
  while (true) {
    console.log("\n=== Nuevo ciclo de sincronización ===");

    // 1. Users
    await syncTable("users", [
      "id",
      "rut",
      "email",
      "password_hash",
      "first_name",
      "last_name",
      "role",
    ], "id");

    // 2. Vehiculo
    await syncTable("vehiculo", [
      "id",
      "patente",
      "marca",
      "tipo_combustible",
      "id_usuario",
    ], "id");

    // 3. Reportes
    await syncTable("reportes", [
      "id",
      "id_vehiculo",
      "estado_motor",
      "km_recorridos",
      "detenciones_vehiculo",
    ], "id");

    // 4. Reporte_eventualidad
    await syncTable("reporte_eventualidad", [
      "id",
      "id_vehiculo",
      "id_usuario",
      "tipo_eventualidad",
      "comentario",
    ], "id");

    console.log("=== Ciclo completado. Esperando 60s... ===\n");
    await new Promise((r) => setTimeout(r, 60000));
  }
}

runSync();
