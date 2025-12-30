package main

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var (
	mongoClient *mongo.Client
	database    *mongo.Database
	collection  *mongo.Collection
)

type MediaFile struct {
	URL  string `json:"url" bson:"url"`
	Type string `json:"type" bson:"type"`
}

type FormRow struct {
	Description string      `json:"description" bson:"description"`
	Media       []MediaFile `json:"media" bson:"media"`
}

type FormSubmission struct {
	ID        primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	Rows      []FormRow          `json:"rows" bson:"rows"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
}

func InitMongo() {
	mongoUri := os.Getenv("MongoDbUri")
	if mongoURI == "" {
		log.Fatal("MONGODB_URI environment variable is not set")
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(mongoUri)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal(err)
	}
	if err := client.Ping(ctx, nil); err != nil {
		log.Fatal(err)
	}
	mongoClient = client
	dbName := os.Getenv("MONGODB_DB_NAME")
	if dbName == "" {
		dbName = "form_builder"
	}
	database = client.Database(dbName)
	collection = database.Collection("submissions")
	log.Println("Connected to MongoDB!")
}

func SaveFormSubmission(submission *FormSubmission) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	submission.CreatedAt = time.Now()
	result, err := collection.InsertOne(ctx, submission)
	if err != nil {
		return err
	}

	submission.ID = result.InsertedID.(primitive.ObjectID)
	return nil
}
