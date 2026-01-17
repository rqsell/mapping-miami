import React, { useState } from "react";
import "../css/form.css";
export default function ItemAdd() {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

    const [form, setForm] = useState({
        name: "",
        location: "",
        title: "",
        imageFile: null,
        imagePreview: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) {
            setForm((f) => ({ ...f, imageFile: null, imagePreview: "" }));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            setForm((f) => ({ ...f, imageFile: file, imagePreview: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare payload
        const payload = {
            name: form.name,
            location: form.location,
            title: form.title,
            description: form.description,
            imageUrl: form.imagePreview,
        };
console.log("Using backend URL:", BACKEND_URL);
        try {
const response = await fetch(`${BACKEND_URL}/add-item`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (data.status === "success") {
                alert("Item added successfully!");
                setForm({ name: "", location: "", title: "", imageFile: null, imagePreview: "" });
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
