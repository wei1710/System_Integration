## **Granulær Adgangskontrol med PostgreSQL**

Databasen **`product`** er tilgængelig via Reverse Tunnel og indeholder:

**Tabeller:**
* **`keyboard`**
* **`mouse`**
* **`person`**

**Brugere:**
* **`postgres`** – Fuld adgang
* **`integrator`** – Begrænset adgang via Row-Level Security

### **Adgangsbegrænsninger**

| Tabel        | Adgang for integrator                   |
| ------------ | --------------------------------------- |
| **keyboard** | Ingen adgang                            |
| **mouse**    | Kun `brand` for id = 1                  |
| **person**   | Kan se og ændre `first_name` for id = 1 |

### **Tabellernes Struktur og Indhold**

**`keyboard`
* Indeholder oplysninger om tastaturer.
* Tabeldata:
    * **`id`**: 1, **`brand`**: "Keychron", **`model`**: "K6", **`price`**: 89.99
    * **`id`**: 2, **`brand`**: "Logitech", **`model`**: "G Pro X", **`price`**: 149.99
    * **`id`**: 3, **`brand`**: "Corsair", **`model`**: "K95 RGB Platinum", **`price`**: 199.99
    * **`id`**: 4, **`brand`**: "Ducky", **`model`**: "One 2 Mini", **`price`**: 129.99

| Kolonne | Type                   | Beskrivelse |
| ------- | ---------------------- | ----------- |
| `id`    | SERIAL PRIMARY KEY     | Unikt Id    |
| `brand` | TEXT NOT NULL          | Mærke       |
| `model` | TEXT NOT NULL          | Modelnavn   |
| `price` | NUMERIC(10,2) NOT NULL | Pris i DKK  |

**`mouse`**
* Indeholder oplysninger om computermus.
* Tabeldata:
    * **`id`**: 1, **`brand`**: "Logitech", **`model`**: "G502", **`price`**: 49.99
    * **`id`**: 2, **`brand`**: "Glourious", **`model`**: "Model O", **`price`**: 59.99
    * **`id`**: 3, **`brand`**: "SteelSeries", **`model`**: "Aerox 5", **`price`**: 79.99
    * **`id`**: 4, **`brand`**: "Cooler Master", **`model`**: "MM720", **`price`**: 49.99

| Kolonne | Type                   | Beskrivelse |
| ------- | ---------------------- | ----------- |
| `id`    | SERIAL PRIMARY KEY     | Unikt Id    |
| `brand` | TEXT NOT NULL          | Mærke       |
| `model` | TEXT NOT NULL          | Modelnavn   |
| `price` | NUMERIC(10,2) NOT NULL | Pris i DKK  |

**`person`**
* Indeholder personoplysninger.
* Tabeldata:
    * **`id`**: 1, **`first_name`**: "Michael", **`last_name`**: "Jones", **`age`**: 28
    * **`id`**: 2, **`first_name`**: "David", **`last_name`**: "Williams", **`age`**: 35
    * **`id`**: 3, **`first_name`**: "James", **`last_name`**: "Evans", **`age`**: 22
    * **`id`**: 4, **`first_name`**: "Thomas", **`last_name`**: "Roberts", **`age`**: 40

| Kolonne      | Type               | Beskrivelse |
| ------------ | ------------------ | ----------- |
| `id`         | SERIAL PRIMARY KEY | Unikt Id    |
| `first_name` | TEXT NOT NULL      | Fornavn     |
| `last_name`  | TEXT NOT NULL      | Efternavn   |
| `age`        | INTEGER NOT NULL   | Alder       |

### **Adgang til databasen**

1.  Opret forbindelse via Reverse Tunnel:

    ```sh
    ssh -p 443 -R0:localhost:5432 tcp@a.pinggy.io
    ```

2. Download og installerer PostgreSQL Client (**`pssql`**):

	**Windows:** 
	- Download PostgreSQL fra **`https://www.enterprisedb.com/downloads/postgres-postgresql-downloads`**.
	- Installer den nyeste version (17.4).
	- Under "Select Components" vælg "Command Line tools".
	- Opret en adgangskode.
	
	**macOS:**
	- Download Homebrew fra **`https://brew.sh/`**.
	- Åbn Terminal og kør: **`brew install postgresql`**
	
	**Linux:**
	- Åbn Terminal og kør: **`sudo apt install postgresql`**

3.  Log ind som integrator:
**`PGPASSWORD='prototype' psql -U integrator -d product -h <url> -p <port>`**

4.  Test adgang:

    ```sql
    SELECT brand FROM mouse;                 -- Kun `brand` for id = 1
    SELECT * FROM keyboard;                  -- Ingen adgang
    SELECT first_name FROM person;           -- Kun `first_name` for id = 1
    UPDATE person SET first_name = 'Kai';    -- Tilladt
    INSERT INTO person (first_name, last_name, age) VALUES 
    ('Peter', 'Hansen', 30);                 -- Ingen adgang
    SELECT * FROM person;                    -- Ingen adgang
    ```
