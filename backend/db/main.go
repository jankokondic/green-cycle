package main

import (
	"errors"
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func main() {
	//connection
	databaseURL := "postgres://green_user:green_password@localhost:5432/green_cycle?sslmode=disable"

	//directory for migrations
	migrationsPath := "file://migrations"

	m, err := migrate.New(migrationsPath, databaseURL)
	if err != nil {
		log.Fatal("migrate init error:", err)
	}

	defer m.Close()

	err = m.Up()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		log.Fatal("migration failed:", err)
	}

	log.Println("migrations applied")
}
