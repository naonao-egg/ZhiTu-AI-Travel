import java.sql.*;
public class QueryDb {
    public static void main(String[] args) throws Exception {
        Connection conn = DriverManager.getConnection("jdbc:h2:file:D:/myproject/实训/demo/data/smarttrek_db", "sa", "");
        ResultSet rs = conn.createStatement().executeQuery("SELECT username, password FROM users");
        while (rs.next()) {
            System.out.println("USER: " + rs.getString("username") + " | PASS: " + rs.getString("password"));
        }
        conn.close();
    }
}
