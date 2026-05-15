import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchProjects } from '../api/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['woodworking', 'furniture', 'electronics'];
const MATERIALS = ['pine', 'oak', 'metal'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const NavigationBar = () => {
    const [searchText, setSearchText] = useState('');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [material, setMaterial] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const isAdmin = user?.roles?.some(role => role.name === 'admin');
    const isModerator = user?.roles?.some(role => role.name === 'moderator');

    const applyFilters = async () => {
        const filters = {};
        if (searchText.trim()) filters.searchText = searchText;
        if (category) filters.category = category;
        if (difficulty) filters.difficulty = difficulty;
        if (material) filters.materialName = material;

        try {
            const data = await searchProjects(filters);
            navigate('/', { state: { projects: data } });
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 20px',
                    borderBottom: '1px solid #dbdbdb',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    gap: '16px',
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                    GreenCycle
                </div>

                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '600px' }}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px'
                        }}
                    />
                    <button style={{
                        alignSelf: 'flex-end',
                        padding: '8px 16px',
                        backgroundColor: '#0a7cff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }} onClick={() => setShowFilters(prev => !prev)}>Filters</button>
                    <button style={{
                        alignSelf: 'flex-end',
                        padding: '8px 16px',
                        backgroundColor: '#0a7cff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }} onClick={applyFilters}>Apply</button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {!user ? (
                        <>
                            <button style={{
                                alignSelf: 'flex-end',
                                padding: '8px 16px',
                                backgroundColor: '#0a7cff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }} onClick={() => navigate('/login')}>Login</button>
                            <button style={{
                                alignSelf: 'flex-end',
                                padding: '8px 16px',
                                backgroundColor: '#0a7cff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }} onClick={() => navigate('/register')}>Register</button>
                        </>
                    ) : (
                        <>
                            {(isAdmin || isModerator) && (
                                <>
                                    <button style={{
                                        alignSelf: 'flex-end',
                                        padding: '8px 16px',
                                        backgroundColor: '#0a7cff',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }} onClick={() => navigate('/material')}>Materials</button>
                                    <button style={{
                                        alignSelf: 'flex-end',
                                        padding: '8px 16px',
                                        backgroundColor: '#0a7cff',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }} onClick={() => navigate('/role')}>Role</button>
                                    <button style={{
                                        alignSelf: 'flex-end',
                                        padding: '8px 16px',
                                        backgroundColor: '#0a7cff',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }} onClick={() => navigate('/report')}>Reports</button>
                                </>
                            )}
                            <button style={{
                                alignSelf: 'flex-end',
                                padding: '8px 16px',
                                backgroundColor: '#0a7cff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }} onClick={() => navigate('/new')}>new</button>
                            <img
                                src={`http://88.200.63.148:12345/${user.profile_picture}`}
                                alt="Avatar"
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '1px solid #ccc'
                                }}
                            />
                            <button style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                fontSize: '0.9rem',
                                color: '#0a7cff',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: '4px 6px'
                            }} onClick={logout}>Logout</button>
                        </>
                    )}
                </div>
            </div >

            {showFilters && (
                <div className="filters-box">
                    <div>
                        <label>Category:</label>
                        <select value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="">All</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Difficulty:</label>
                        <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                            <option value="">All</option>
                            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Material:</label>
                        <select value={material} onChange={e => setMaterial(e.target.value)}>
                            <option value="">All</option>
                            {MATERIALS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                </div>
            )
            }
        </>
    );
};

export default NavigationBar;
