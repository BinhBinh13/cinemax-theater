import { useEffect, useRef, useState } from "react";
import {
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

function resolveImageUrl(url) {
  if (!url) return "";
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

const S = {
  page: {
    background: "#f5f5f9",
    minHeight: "100vh",
    color: "#1f2937",
  },
  header: {
    fontSize: 26,
    fontWeight: 700,
    color: "#111827",
    letterSpacing: 0.5,
  },
  headerAccent: { color: "#e50914" },
  searchInput: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    color: "#1f2937",
    borderRadius: 10,
    padding: "10px 16px",
    maxWidth: 300,
    outline: "none",
    fontSize: 14,
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },
  addBtn: {
    background: "linear-gradient(135deg, #e50914, #b80710)",
    border: "none",
    borderRadius: 10,
    padding: "10px 22px",
    fontWeight: 600,
    fontSize: 14,
    color: "#fff",
    boxShadow: "0 2px 8px rgba(229,9,20,0.3)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 14,
    border: "1px solid #e5e7eb",
    padding: "18px",
    transition: "all 0.25s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  thumb: {
    width: "100%",
    height: 140,
    objectFit: "cover",
    borderRadius: 10,
    marginBottom: 14,
    background: "#f3f4f6",
  },
  thumbPlaceholder: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    marginBottom: 14,
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#9ca3af",
    fontSize: 13,
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#111827",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 700,
    color: "#e50914",
    marginTop: 8,
    marginBottom: 14,
  },
  cardActions: {
    display: "flex",
    gap: 8,
    paddingTop: 14,
    borderTop: "1px solid #e5e7eb",
  },
  actionBtn: {
    border: "none",
    borderRadius: 8,
    padding: "7px 16px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  emptyState: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "60px 0",
    color: "#9ca3af",
  },
};

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
    <div className="d-flex">
      <StaffSideBar />
      <div style={S.page} className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div style={S.header}>
            🍿 <span style={S.headerAccent}>Food</span> &amp; Drinks
          </div>
          <Button style={S.addBtn} onClick={openAddModal}>
            + Add new item
          </Button>
        </div>

        {message && (
          <Alert
            variant={isError ? "danger" : "success"}
            onClose={() => setMessage("")}
            dismissible
          >
            {message}
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <input
            type="text"
            placeholder="Search item by name..."
            style={S.searchInput}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <span style={{ color: "#9ca3af", fontSize: 13 }}>
            {visibleItems.length} item{visibleItems.length !== 1 && "s"}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
            Loading items...
          </div>
        ) : (
          <div style={S.grid}>
            {visibleItems.length === 0 ? (
              <div style={S.emptyState}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🍿</div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 4,
                    color: "#6b7280",
                  }}
                >
                  No items found
                </div>
                <div style={{ fontSize: 13 }}>
                  {q
                    ? "Try a different search term."
                    : 'Click "+ Add new item" to get started.'}
                </div>
              </div>
            ) : (
              visibleItems.map((item) => (
                <div key={item.id} style={S.card}>
                  {item.imageURL ? (
                    <img
                      src={resolveImageUrl(item.imageURL)}
                      alt={item.itemName}
                      style={S.thumb}
                    />
                  ) : (
                    <div style={S.thumbPlaceholder}>No image</div>
                  )}

                  <div style={S.itemHeader}>
                    <div style={S.itemName}>{item.itemName}</div>
                    <Badge
                      bg={item.status === "ACTIVE" ? "success" : "secondary"}
                      style={{
                        borderRadius: 6,
                        fontSize: 11,
                        padding: "4px 10px",
                        flexShrink: 0,
                      }}
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div style={S.metaRow}>
                    <span>{item.itemType}</span>
                    <span>Qty: {item.quantityInStock}</span>
                  </div>

                  <div style={S.price}>
                    {Number(item.price).toLocaleString("vi-VN")} đ
                  </div>

                  <div style={S.cardActions}>
                    <button
                      style={{
                        ...S.actionBtn,
                        background: "#f3f4f6",
                        color: "#374151",
                      }}
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </button>
                    <button
                      style={{
                        ...S.actionBtn,
                        background: "#fef2f2",
                        color: "#ef4444",
                      }}
                      onClick={() => handleDelete(item)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={closeModal} size="lg">
        <Modal.Header closeButton style={{ borderBottom: "1px solid #e5e7eb" }}>
          <Modal.Title
            style={{ color: "#111827", fontSize: 18, fontWeight: 700 }}
          >
            {editingItem ? "✏️ Update item" : "➕ Add new item"}
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
                    border: `2px dashed ${dragActive ? "#e50914" : "#f3b4b8"}`,
                    borderRadius: 8,
                    background: dragActive ? "#fdecea" : "#fff8f8",
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
          <Modal.Footer style={{ borderTop: "1px solid #e5e7eb" }}>
            <Button
              variant="secondary"
              onClick={closeModal}
              style={{ borderRadius: 8, padding: "8px 20px" }}
            >
              Cancel
            </Button>
            {!editingItem && (
              <Button
                variant="outline-danger"
                type="button"
                onClick={handleSaveDraft}
                style={{ borderRadius: 8, padding: "8px 20px" }}
              >
                Save Draft
              </Button>
            )}
            <Button
              type="submit"
              disabled={uploading}
              style={{
                background: "linear-gradient(135deg, #e50914, #b80710)",
                border: "none",
                borderRadius: 8,
                padding: "8px 24px",
                fontWeight: 600,
              }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
