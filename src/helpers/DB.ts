import { Pool } from "./Pool";
import { PoolConnection, MysqlError, queryCallback } from "mysql";
import { LoggingHelper } from "./LoggingHelper";

export class DB {

    // wraps in promise
    static async getConnection() {
        const promise: Promise<PoolConnection> = new Promise((resolve, reject) => {
            Pool.current.getConnection((ex: MysqlError, conn: PoolConnection) => { if (ex) reject(ex); else resolve(conn); });
        });;
        const connection: PoolConnection = await promise;
        return connection;
    }

    // wraps in promise
    static async getQuery(connection: PoolConnection, sql: string, params: any[]) {
        const promise: Promise<queryCallback> = new Promise((resolve, reject) => {
            connection.query(sql, params, async (ex, rows) => {
                if (ex) { LoggingHelper.getCurrent().error(ex); reject(ex); }
                else { resolve(rows); }
            });
        });
        const query: queryCallback = await promise;
        return query;
    }

    public static async query(sql: string, params: any[]) {
        let result: any = null;
        const connection = await this.getConnection();
        try { result = await this.getQuery(connection, sql, params); }
        catch (ex:any) { LoggingHelper.getCurrent().error(ex); }
        finally { connection.release(); }
        return result;
    }

    public static async queryOne(sql: string, params: any[]) {
        const result: any = await this.query(sql, params);
        return result.length > 0 ? result[0] : null;
    }
}