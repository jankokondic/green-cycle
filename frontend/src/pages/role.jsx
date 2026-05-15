import React, { useEffect, useState } from 'react';
import { fetchRoles, assignRole, removeRole } from '../api/api';
import "./css/roles.css"
import Container from '../component/container'

const ALL_ROLES = [
    { id: 1, name: 'admin' },
    { id: 2, name: 'moderator' },
    { id: 3, name: 'user' }
];

const RoleList = () => {
    const [users, setUsers] = useState([]);
    const [selectedAdd, setSelectedAdd] = useState({});
    const [selectedRemove, setSelectedRemove] = useState({});
    const [loading, setLoading] = useState(true);

    const loadUsers = async () => {
        try {
            const data = await fetchRoles();
            setUsers(data);
        } catch (err) {
            console.error('Error while loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddRole = async (userId) => {
        const roleId = selectedAdd[userId];
        if (!roleId) return;

        try {
            await assignRole(userId, roleId);
            await loadUsers();
        } catch (err) {
            console.error('Error while adding role:', err);
        }
    };

    const handleRemoveRole = async (userId) => {
        const roleId = selectedRemove[userId];
        if (!roleId) return;

        try {
            console.log(userId, roleId)
            await removeRole(userId, roleId);
            await loadUsers();
        } catch (err) {
            console.error('Error while removing role:', err);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    if (loading) return <p>Loading...</p>;

    return (
        <Container>
            <h2>Users and Role Management</h2>
            <ul>
                {users.map(user => {
                    const userRoleNames = user.roles.map(r => r.name);
                    const availableRolesToAdd = ALL_ROLES.filter(role => !userRoleNames.includes(role.name));
                    const availableRolesToRemove = ALL_ROLES.filter(role =>
                        role.name !== 'user' && userRoleNames.includes(role.name)
                    );

                    return (
                        <div key={user.user_id} className="role-user">
                            <strong>{user.username}</strong>

                            <div>
                                <select
                                    value={selectedAdd[user.user_id] || ''}
                                    onChange={e =>
                                        setSelectedAdd(prev => ({ ...prev, [user.user_id]: Number(e.target.value) }))
                                    }
                                >
                                    <option value="">Assign role...</option>
                                    {availableRolesToAdd.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                                <button onClick={() => handleAddRole(user.user_id)}>Add</button>
                            </div>

                            <div>
                                <select
                                    value={selectedRemove[user.user_id] || ''}
                                    onChange={e =>
                                        setSelectedRemove(prev => ({ ...prev, [user.user_id]: Number(e.target.value) }))
                                    }
                                >
                                    <option value="">Delete role...</option>
                                    {availableRolesToRemove.map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
                                <button onClick={() => handleRemoveRole(user.user_id)}>Delete</button>
                            </div>
                        </div>
                    );
                })}
            </ul>
        </Container>
    );
};

export default RoleList;