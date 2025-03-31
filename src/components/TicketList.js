import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const TicketList = () => {
    const { user: currentUser } = useSelector((state) => state.auth);
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState(null);
    const [editingTicketId, setEditingTicketId] = useState(null);
    const [editedTitle, setEditedTitle] = useState("");
    const [editedDescription, setEditedDescription] = useState("");

    const isAdmin = currentUser?.roles.includes("ROLE_ADMIN");
    const isModerator = currentUser?.roles.includes("ROLE_MODERATOR");

    const statusMap = {
        NEW: "Новая",
        IN_PROGRESS: "В работе",
        DONE: "Завершена",
    };

    const fetchTickets = async () => {
        try {
            const token = currentUser.token;
            const userIdParam = isAdmin ? "" : `?userId=${currentUser.id}`;

            const response = await axios.get(`http://localhost:8089/api/tickets${userIdParam}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTickets(response.data);
        } catch (err) {
            setError("Ошибка загрузки заявок");
        }
    };

    const handleDelete = async (ticketId) => {
        try {
            await axios.delete(`http://localhost:8089/api/tickets/${ticketId}`, {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            });
            setTickets(tickets.filter((t) => t.id !== ticketId));
        } catch (err) {
            alert("Ошибка при удалении заявки");
        }
    };

    const handleStatusChange = async (ticketId, status) => {
        try {
            await axios.put(
                `http://localhost:8089/api/tickets/${ticketId}/status?status=${status}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                }
            );
            fetchTickets();
        } catch (err) {
            alert("Ошибка при обновлении статуса");
        }
    };

    const startEditing = (ticket) => {
        setEditingTicketId(ticket.id);
        setEditedTitle(ticket.title);
        setEditedDescription(ticket.description);
    };

    const saveEdit = async (ticketId) => {
        try {
            await axios.put(
                `http://localhost:8089/api/tickets/${ticketId}`,
                { title: editedTitle, description: editedDescription },
                {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            setEditingTicketId(null);
            fetchTickets();
        } catch (err) {
            alert("Ошибка при сохранении изменений");
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    return (
        <div className="container mt-5">
            <h3 className="mb-4 text-center text-primary">Список заявок</h3>

            {error && <div className="alert alert-danger">{error}</div>}

            <table className="table table-striped">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Заголовок</th>
                    <th>Описание</th>
                    <th>Статус</th>
                    <th>Дата создания</th>
                    <th>Действия</th>
                </tr>
                </thead>
                <tbody>
                {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                        <td>{ticket.id}</td>
                        <td>
                            {editingTicketId === ticket.id ? (
                                <input
                                    type="text"
                                    className="form-control"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                />
                            ) : (
                                ticket.title
                            )}
                        </td>
                        <td>
                            {editingTicketId === ticket.id ? (
                                <textarea
                                    className="form-control"
                                    rows={2}
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                />
                            ) : (
                                ticket.description
                            )}
                        </td>
                        <td>{statusMap[ticket.status] ?? ticket.status}</td>
                        <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                        <td>
                            {editingTicketId === ticket.id ? (
                                <button
                                    className="btn btn-success btn-sm me-2"
                                    onClick={() => saveEdit(ticket.id)}
                                >
                                    Сохранить
                                </button>
                            ) : (
                                <button
                                    className="btn btn-outline-primary btn-sm me-2"
                                    onClick={() => startEditing(ticket)}
                                >
                                    Изменить
                                </button>
                            )}
                            {(isAdmin || isModerator) && (
                                <select
                                    className="form-select d-inline w-auto me-2"
                                    value={ticket.status}
                                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                >
                                    <option value="NEW">Новая</option>
                                    <option value="IN_PROGRESS">В работе</option>
                                    <option value="DONE">Завершена</option>
                                </select>
                            )}
                            {isAdmin && (
                                <button
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => handleDelete(ticket.id)}
                                >
                                    Удалить
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default TicketList;
