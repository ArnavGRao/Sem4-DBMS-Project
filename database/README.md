# MariaDB setup for Windows

This folder contains the database schema for the project in [db_schema.sql](db_schema.sql). The schema was exported from MariaDB and is intended to be imported into a local MariaDB server on Windows.

## What you need

- Windows 10 or Windows 11
- Administrator access to install software
- The schema file in this folder: [db_schema.sql](db_schema.sql)
- A terminal, such as Command Prompt, PowerShell, or Windows Terminal

## 1. Download MariaDB

1. Open the official MariaDB downloads page: https://mariadb.org/download/
2. Choose the Windows installer for the latest stable MariaDB Server release.
3. Download the MSI installer to your computer.

If you prefer a graphical database client, you can also install one later, but it is not required. MariaDB includes the command line tools needed to import the schema.

## 2. Install MariaDB on Windows

1. Run the downloaded `.msi` installer.
2. Accept the license terms.
3. Choose the default installation path unless you have a specific reason to change it.
4. Select the server version recommended by the installer.
5. Keep the MariaDB service option enabled so Windows can start the database automatically.
6. Set the root password when prompted and store it safely. This is the password you will use later to connect to MariaDB.
7. Finish the installation.

During installation, note the port number. The default MariaDB port is `3306`.

## 3. Confirm MariaDB is running

After installation, open Services in Windows and check that the MariaDB service is running.

You can also verify it from a terminal:

```powershell
mysql --version
```

If the command is not found, open a new terminal after installation or add the MariaDB `bin` folder to your `PATH`. The installer usually offers an option to do this automatically.

## 4. Create the database

The schema dump uses the database name `UPI_System`. Create it before importing the schema.

Open PowerShell or Command Prompt and run:

```powershell
mysql -u root -p
```

Enter the root password you created during installation, then run:

```sql
CREATE DATABASE UPI_System;
EXIT;
```

If the database already exists, you can skip this step.

## 5. Import the schema

From the same folder as `db_schema.sql`, run:

```powershell
mysql -u root -p UPI_System < db_schema.sql
```

If you are not in this folder, either change directories first or use the full path to the file. Example:

```powershell
mysql -u root -p UPI_System < "C:\path\to\DBMS Project\database\db_schema.sql"
```

This creates the tables defined in the dump, including:

- `Users`
- `Accounts`
- `Transactions`
- `Transaction_Audit_Log`

## 6. Verify the import

Log in to MariaDB and confirm that the tables exist:

```powershell
mysql -u root -p UPI_System
```

Then run:

```sql
SHOW TABLES;
DESCRIBE Users;
DESCRIBE Accounts;
DESCRIBE Transactions;
DESCRIBE Transaction_Audit_Log;
```

If those commands return table definitions without errors, the schema was imported successfully.

## 7. Optional: use a GUI client

If you prefer a graphical tool, install one of these clients:

- HeidiSQL
- DBeaver
- MySQL Workbench

Connect using these values:

- Host: `localhost`
- Port: `3306`
- User: `root`
- Password: the root password you created during installation
- Database: `UPI_System`

Then import the schema by opening [db_schema.sql](db_schema.sql) and running it against the `UPI_System` database.

## 8. Common issues

### `mysql` is not recognized

The MariaDB `bin` folder is not on your `PATH`. Add the MariaDB installation directory to `PATH`, then open a new terminal and try again.

### Access denied for user `root`

Check that you are using the correct root password you created during MariaDB installation. If needed, rerun the MariaDB installer or reset the password using MariaDB's recovery instructions.

### Foreign key errors during import

Import the schema from the provided dump without editing table order. The dump already contains the required table creation order and foreign key statements.

### Port `3306` already in use

Another database server may already be running on that port. Stop the conflicting service or install MariaDB on a different port.

## 9. Quick recap

1. Install MariaDB on Windows.
2. Create the `UPI_System` database.
3. Import [db_schema.sql](db_schema.sql).
4. Verify the tables were created.

That is enough to get the project database ready for local development.
