import React, { useState } from "react";
import "../css/form.css";

export default function ItemAdd() {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

    const [form, setForm] = useState({
        name: "",
        location: "",
        title: "",
        description: "", 
        imageFile: null,
        imagePreview: ""
    });

   const handleSubmit = async (e) => {
        e.preventDefault();

        // Use FormData instead of JSON
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('location', form.location);
        formData.append('title', form.title);
        formData.append('description', form.description);
        
        if (form.imageFile) {
            formData.append('image', form.imageFile);
        }

        try {
            const response = await fetch(`${BACKEND_URL}/add-item`, {
                method: "POST",
                body: formData, // No Content-Type header needed
            });

            const data = await response.json();
            if (data.status === "success") {
                alert("Item added successfully!");
                setForm({ 
                    name: "", 
                    location: "", 
                    title: "", 
                    description: "",
                    imageFile: null, 
                    imagePreview: "" 
                });
            } else {
                alert("Failed to add item: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Error submitting form: " + err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{    display: "flex", flexDirection: "column", alignItems: "center",    marginTop: "2em"}}>
            <table style={{ borderCollapse: "collapse", backgroundColor: " #f08c048c;", borderRadius: "24px"}}>
                <tbody>
                    <tr>
                        <th className="formHead" style={{ textAlign: "left", padding: 16 }}>Name</th>
                        <td style={{ padding: 16 }}>
                            <input
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                required
                            />
                        </td>
                    </tr>

                    <tr>
                        <th className="formHead" style={{ textAlign: "left", padding: 16 }}>Location</th>
                        <td style={{ padding: 16 }}>
                            <input
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>

                    <tr>
                        <th className="formHead" style={{ textAlign: "left", padding: 16 }}>Title</th>
                        <td style={{ padding: 16 }}>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>

                    <tr>
                        <th  className="formHead" style={{ textAlign: "left", padding: 16 }}>Description</th>
                        <td style={{ padding: 16 }}>
                            <input
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                            />
                        </td>
                    </tr>

                    <tr>
                        <th className="formHead" style={{ textAlign: "left", padding: 16 }}>Image</th>
                        <td style={{ padding: 16 }}>
                            <input type="file" accept="image/*" onChange={handleImageChange} />
                            {form.imagePreview && (
                                <div style={{ marginTop: 16 }}>
                                    <img
                                        src={form.imagePreview}
                                        alt="preview"
                                        style={{ maxWidth: "150px", maxHeight: "150px", display: "block" }}
                                    />
                                </div>
                            )}
                        </td>
                    </tr>

                    <tr>
                        <td colSpan="2" style={{ padding: 16, textAlign: "center" }}>
                            <button type="submit">Add</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </form>
    );
}