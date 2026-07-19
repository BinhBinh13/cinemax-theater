import { useEffect, useRef, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Badge,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import StaffSideBar from "../components/StaffSideBar";
import { BASE_URL } from "@/shared/services/axiosClient";
import { uploadImage } from "@/shared/services/uploadService";
import {
  getFoodDrinks,
  createFoodDrink,
  updateFoodDrink,
  deleteFoodDrink,
} from "../services/foodDrinkService";

// imageURL is stored as a relative path (e.g. "/uploads/xxx.png"); resolve it
// against the backend origin for <img> tags, which don't go through axios.
function resolveImageUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

const emptyForm = {
  itemName: "",
  price: "",
  quantityInStock: "",
  imageURL: "",
  itemType: "FOOD",
  status: "ACTIVE",
};

const DRAFT_KEY = "foodDrinkDraft";

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveDraft(formData) {
  localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export default function FoodDrinkListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const response = await getFoodDrinks();
      setItems(response.data);
    } catch (error) {
      setIsError(true);
      setMessage(`Failed to load items: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  function openAddModal() {
    setEditingItem(null);
    const draft = loadDraft();
    if (draft) {
      setForm(draft);
      setIsError(false);
      setMessage("Restored your saved draft.");
    } else {
      setForm(emptyForm);
    }
    setFormError("");
    setShowModal(true);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setForm({
      itemName: item.itemName,
      price: item.price,
      quantityInStock: item.quantityInStock,
      imageURL: item.imageURL,
      itemType: item.itemType,
      status: item.status,
    });
    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingItem(null);
    setForm(emptyForm);
    setFormError("");
  }

  async function processFile(file) {
    setUploading(true);
    setFormError("");
    try {
      const response = await uploadImage(file);
      setForm((prev) => ({ ...prev, imageURL: response.data.url }));
    } catch (error) {
      setFormError(error.response?.data || error.message);
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) processFile(file);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    if (uploading) return;
    const file = event.dataTransfer.files[0];
    if (file) processFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.imageURL) {
      setFormError("Please upload an image before saving.");
      return;
    }

    const payload = {
      itemName: form.itemName,
      price: Number(form.price),
      quantityInStock: Number(form.quantityInStock),
      imageURL: form.imageURL,
      itemType: form.itemType,
      status: form.status,
    };

    try {
      if (editingItem) {
        await updateFoodDrink(editingItem.id, payload);
        setMessage("Item updated successfully.");
      } else {
        await createFoodDrink(payload);
        clearDraft();
        setMessage("Item added successfully.");
      }
      setIsError(false);
      closeModal();
      await loadItems();
    } catch (error) {
      setFormError(error.response?.data || error.message);
    }
  }

  function handleSaveDraft() {
    saveDraft(form);
    setIsError(false);
    setMessage('Draft saved. Reopen "Add new item" to continue later.');
    setShowModal(false);
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.itemName}"? This cannot be undone.`))
      return;

    try {
      await deleteFoodDrink(item.id);
      setIsError(false);
      setMessage("Item deleted successfully.");
      await loadItems();
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data || error.message);
    }
  }

  const q = searchText.trim().toLowerCase();
  const visibleItems = q
    ? items.filter((item) => item.itemName.toLowerCase().includes(q))
    : items;

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <StaffSideBar />
      <main className="flex-grow-1 p-4">
        <h4 className="fw-normal mb-4">Food &amp; Drinks</h4>

        {message && (
          <Alert
            variant={isError ? "danger" : "success"}
            onClose={() => setMessage("")}
            dismissible
          >
            {message}
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-3">
          <Form.Control
            type="text"
            placeholder="Search item by name..."
            style={{ maxWidth: 280 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button variant="primary" onClick={openAddModal}>
            + Add new item
          </Button>
        </div>

        {loading ? (
          <div className="text-muted">Loading items...</div>
        ) : (
          <Table responsive bordered hover>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Price (VND)</th>
                <th>Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No items found.
                  </td>
                </tr>
              ) : (
                visibleItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.imageURL ? (
                        <img
                          src={resolveImageUrl(item.imageURL)}
                          alt={item.itemName}
                          style={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      ) : (
                        <span className="text-muted">No image</span>
                      )}
                    </td>
                    <td>{item.itemName}</td>
                    <td>{item.itemType}</td>
                    <td>{item.quantityInStock}</td>
                    <td>{Number(item.price).toLocaleString("vi-VN")}</td>
                    <td>
                      <Badge
                        bg={item.status === "ACTIVE" ? "success" : "secondary"}
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td className="text-center text-nowrap">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        className="me-2"
                        onClick={() => openEditModal(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleDelete(item)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        )}
      </main>

      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingItem ? "Update item" : "Add new item"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {formError && <Alert variant="danger">{formError}</Alert>}

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>
                Item name
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="text"
                  required
                  value={form.itemName}
                  onChange={(e) =>
                    setForm({ ...form, itemName: e.target.value })
                  }
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>
                Type
              </Form.Label>
              <Col sm={9}>
                <Form.Select
                  value={form.itemType}
                  onChange={(e) =>
                    setForm({ ...form, itemType: e.target.value })
                  }
                >
                  <option value="FOOD">Food</option>
                  <option value="DRINK">Drink</option>
                </Form.Select>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>
                Quantity
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="number"
                  required
                  min={1}
                  value={form.quantityInStock}
                  onChange={(e) =>
                    setForm({ ...form, quantityInStock: e.target.value })
                  }
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>
                Price (VND)
              </Form.Label>
              <Col sm={9}>
                <Form.Control
                  type="number"
                  required
                  min={1000}
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>
                Upload Photo
              </Form.Label>
              <Col sm={9}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif"
                  onChange={handleFileChange}
                  disabled={uploading}
                  style={{ display: "none" }}
                />
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${dragActive ? "#6d28d9" : "#c7c7f5"}`,
                    borderRadius: 8,
                    background: dragActive ? "#ede9fe" : "#f5f5ff",
                    padding: "28px 16px",
                    textAlign: "center",
                    cursor: uploading ? "not-allowed" : "pointer",
                  }}
                >
                  {uploading ? (
                    <Spinner animation="border" size="sm" />
                  ) : form.imageURL ? (
                    <img
                      src={resolveImageUrl(form.imageURL)}
                      alt="Preview"
                      style={{
                        width: 300,
                        height: 300,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #dee2e6",
                      }}
                    />
                  ) : (
                    <>
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: "#9ca3af" }}
                      >
                        <path
                          d="M7 18a4.5 4.5 0 0 1-.5-8.97A5.5 5.5 0 0 1 17.3 8.03 4 4 0 0 1 17 16"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 11v7m0-7 3 3m-3-3-3 3"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="fw-semibold mt-1">Upload a File</div>
                      <div className="text-muted small">
                        Drag and drop files here
                      </div>
                    </>
                  )}
                </div>
                <Form.Text className="text-muted">
                  PNG, JPG, WEBP or GIF, up to 5MB.
                </Form.Text>
              </Col>
            </Form.Group>

            <Form.Group as={Row} className="mb-3">
              <Form.Label column sm={3}>
                Status
              </Form.Label>
              <Col sm={9}>
                <Form.Check
                  inline
                  type="radio"
                  label="Active"
                  name="status"
                  checked={form.status === "ACTIVE"}
                  onChange={() => setForm({ ...form, status: "ACTIVE" })}
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Inactive"
                  name="status"
                  checked={form.status === "INACTIVE"}
                  onChange={() => setForm({ ...form, status: "INACTIVE" })}
                />
              </Col>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            {!editingItem && (
              <Button
                variant="outline-primary"
                type="button"
                onClick={handleSaveDraft}
              >
                Save Draft
              </Button>
            )}
            <Button variant="primary" type="submit" disabled={uploading}>
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
