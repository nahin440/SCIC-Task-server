require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const http = require('http'); // Import HTTP module
const { Server } = require('socket.io'); // Import socket.io

const app = express();
const port = process.env.PORT || 5000;

// Create HTTP server for WebSockets
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});


// const uri = "mongodb+srv:${process.env.DB_USER}:{process.env.DB_PASS}@cluster0.slbhc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// taskManager   gXljZ8FLIehta3Xj

// Middleware
app.use(cors());
app.use(express.json());

// // Connect to MongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.slbhc.mongodb.net/taskDB?retryWrites=true&w=majority&appName=Cluster0`;


// const uri = `mongodb+srv:${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.slbhc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri);

async function connectDB() {
    try {
        await client.connect();
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
    }
}
connectDB();

const taskCollection = client.db("taskDB").collection("tasks");
const userCollection= client.db("taskDB").collection("users");

// WebSocket Connection
io.on("connection", (socket) => {
    console.log("A client connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("A client disconnected:", socket.id);
    });
});

// API for creating a task
app.post('/tasks', async (req, res) => {
    try {
        const { title, description, category, userId } = req.body;

        const highestOrderTask = await taskCollection.find({ category }).sort({ order: -1 }).limit(1).toArray();
        const newOrder = highestOrderTask.length > 0 ? highestOrderTask[0].order + 1 : 1;

        const newTask = {
            title,
            description: description || "",
            timestamp: new Date(),
            category: category || "To-Do",
            userId,
            order: newOrder
        };

        await taskCollection.insertOne(newTask);
        io.emit("taskCreated", { success: true, task: newTask });

        res.status(201).send({ success: true });
    } catch (error) {
        res.status(500).send({ message: "Failed to create task", error });
    }
});

// API to get all tasks for a user
app.get('/tasks', async (req, res) => {
    try {
        const userId = req.query.email;

        if (!userId) {
            return res.status(400).send({ message: "User ID is required" });
        }

        const tasks = await taskCollection.find({ userId }).toArray();
        res.send(tasks);
    } catch (error) {
        res.status(500).send({ message: "Failed to retrieve tasks", error });
    }
});

// API for updating a task
app.patch('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;

        const updatedTask = {};
        if (title !== undefined) updatedTask.title = title;
        if (description !== undefined) updatedTask.description = description;

        if (Object.keys(updatedTask).length === 0) {
            return res.status(400).send({ message: "No valid fields to update." });
        }

        const result = await taskCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedTask }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send({ message: "Task not found or no changes made." });
        }

        res.send({ success: true, message: "Task updated successfully" });
    } catch (error) {
        res.status(500).send({ message: "Failed to update task", error });
    }
});

// API for reordering a task
app.put('/tasks/reorder', async (req, res) => {
    try {
        const { reorderedTasks } = req.body;

        if (!Array.isArray(reorderedTasks) || reorderedTasks.length === 0) {
            console.error("Invalid task order data received:", reorderedTasks);
            return res.status(400).send({ message: "Invalid task order data received." });
        }

        console.log("✅ Received reordered tasks:", reorderedTasks); // Debugging log

        const bulkOperations = reorderedTasks.map((task) => {
            if (!task._id || typeof task.order !== "number" || !task.category) {
                console.error("Invalid task structure:", task);
                return null;
            }

            return {
                updateOne: {
                    filter: { _id: new ObjectId(task._id) },
                    update: { $set: { order: task.order, category: task.category } }
                }
            };
        }).filter(Boolean); // Remove null values

        if (bulkOperations.length === 0) {
            console.error("No valid bulk operations to process.");
            return res.status(400).send({ message: "No valid tasks to update." });
        }

        console.log("Performing bulk update:", bulkOperations);
        await taskCollection.bulkWrite(bulkOperations);

        io.emit("tasksReordered", { success: true, reorderedTasks });
        res.send({ success: true });

    } catch (error) {
        console.error("Error reordering tasks:", error);
        res.status(500).send({ message: "Failed to reorder tasks.", error: error.message });
    }
});

// API for deleting a Task
app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await taskCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: "Task not found" });
        }

        io.emit("taskDeleted", { success: true, taskId: id });

        res.send({ success: true, message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).send({ message: "Failed to delete task", error });
    }
});

// Authentication related API
app.put('/users', async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const options = { upsert: true };
    const updateDoc = {
        $set: {
            name: user.name,
            email: user.email,
            photo: user.photo,
            createdAt: user.createdAt,
            uid: user.uid,
        },
    };
    const result = await userCollection.updateOne(filter, updateDoc, options);
    res.send(result);
});

app.get('/', (req, res) => {
    res.send('Task Management API is running!');
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});