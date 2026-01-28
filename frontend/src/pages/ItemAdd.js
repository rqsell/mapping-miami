import React, { useState } from "react";
import "../css/form.css";

export default function ItemAdd() {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

    // Authentication state
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");  
    const CORRECT_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;

     // form state
    const [form, setForm] = useState({
    workshopLocation: "",
    name: "",
    location: "",
    title: "",
    description: "",
    imageUrl: "",
    imageFile: null,
    imagePreview: ""
});
//Commenting out file upload for 1/31 test
//const [uploadMethod, setUploadMethod] = useState("url"); // "url" or "file"

const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
};

//Commenting out file upload for 1/31 test
/*
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
*/

const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        let response;
        /* Commenting out file upload for 1/31 test
        
        if (uploadMethod === "file" && form.imageFile) {
            // Upload file using FormData
            const formData = new FormData();
            formData.append('workshopLocation', form.workshopLocation);
            formData.append('name', form.name);
            formData.append('location', form.location);
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('image', form.imageFile);

            response = await fetch(`${BACKEND_URL}/add-item`, {
                method: "POST",
                body: formData,
            });
        } 
            */
          // else {
            // Send URL as JSON

            response = await fetch(`${BACKEND_URL}/add-item`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    workshopLocation: form.workshopLocation,
                    name: form.name,
                    location: form.location,
                    title: form.title,
                    description: form.description,
                    imageUrl: form.imageUrl
                }),
            });
       // }

        if (!response.ok) {
            const text = await response.text();
            console.error('Server response:', text);
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.status === "success") {
            alert("Item added successfully!");
            setForm({ 
                workshopLocation: "Main Branch 1/31/26",
                name: "", 
                location: "", 
                title: "", 
                description: "",
                imageUrl: "",
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
                        <th className="formHead" style={{ textAlign: "left", padding: 16 }}>Workshop Location </th>
                        <td style={{ padding: 16 }}>
                     <option value="">-- Select Location --</option>
<select name="workshopLocation" value={form.workshopLocation} onChange={handleChange} required>
    <option value="">-- Select Location --</option>
    <option value="Main Branch 1/31/26">Main Branch 1/31/26</option>
    <option value="Other Location">Other Location</option>
</select>
                        </td>
                    </tr>
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
        {/* Toggle between URL and File upload, But commenting out for 1/31 test */}
         {/*
        <div style={{ marginBottom: 12 }}>
           
            }<label style={{ marginRight: 16 }}>
                <input 
                    type="radio" 
                    name="uploadMethod" 
                    value="url"
                    checked={uploadMethod === "url"}
                    onChange={(e) => setUploadMethod(e.target.value)}
                />
                {' '}Image URL
            </label>
            <label>
                <input 
                    type="radio" 
                    name="uploadMethod" 
                    value="file"
                    checked={uploadMethod === "file"}
                    onChange={(e) => setUploadMethod(e.target.value)}
                />
                {' '}Upload FILE
            </label>
         
        </div>
   */}
       <div>
                <input
                    name="imageUrl"
                    type="url"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    style={{ width: '100%' }}
                />
                {form.imageUrl && (
                    <div style={{ marginTop: 16 }}>
                        <img
                            src={form.imageUrl}
                            alt="preview"
                            style={{ maxWidth: "150px", maxHeight: "150px", display: "block" }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                        />
                    </div>
                )}
            </div>
        
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