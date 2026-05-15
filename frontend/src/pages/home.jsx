import React, { useState, useEffect, useRef } from 'react';
import { searchProjects, deleteProject, reportProject } from '../api/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Container from '../component/container';
import './css/home.css';

const ProjectList = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportProjectId, setReportProjectId] = useState(null);
    const [reportData, setReportData] = useState({ type: 'Spam', reason: '' });

    const reportRef = useRef();

    useEffect(() => {
        if (location.state?.projects) {
            setProjects(location.state.projects);
            setLoading(false);
        } else {
            (async () => {
                setLoading(true);
                try {
                    const data = await searchProjects();
                    setProjects(data);
                } catch (err) {
                    console.error('Error fetching projects:', err);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [location.state]);

    const isAdminOrMod = user?.roles?.some(r => r.name === 'admin' || r.name === 'moderator');

    const handleDelete = async (projectId) => {
        try {
            await deleteProject(projectId);
            setProjects(prev => prev.filter(p => p.project_id !== projectId));
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const handleReportSubmit = async () => {
        try {
            await reportProject({ ...reportData, project_id: reportProjectId });
            setShowReportModal(false);
            setReportData({ type: 'Spam', reason: '' });
        } catch (err) {
            console.error('Report failed:', err);
        }
    };

    const openReportModal = (projectId) => {
        setReportProjectId(projectId);
        setShowReportModal(true);
    };

    return (
        <Container>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <ul className="home-list">
                    {projects.map(project => {
                        const isOwner = user?.user_id === project.user_id;
                        return (
                            <li className="home-element" key={project.project_id}>
                                <div className="card-header">
                                    <h3>{project.title}</h3>
                                    <div className="menu-wrapper">
                                        <button
                                            onClick={() =>
                                                setMenuOpenId(menuOpenId === project.project_id ? null : project.project_id)
                                            }
                                            className="menu-button"
                                        >
                                            &#8942;
                                        </button>
                                        {menuOpenId === project.project_id && (
                                            <div className="menu-dropdown">
                                                {user && (
                                                    <>
                                                        <button onClick={() => openReportModal(project.project_id)}>Report</button>
                                                    </>
                                                )}
                                                {(isAdminOrMod || isOwner) && (
                                                    <>
                                                        <button onClick={() => navigate(`/edit/${project.project_id}`)}>Edit</button>
                                                        <button onClick={() => handleDelete(project.project_id)}>Delete</button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ cursor: 'pointer' }} onClick={() => navigate(`/project/${project.project_id}`)}>
                                    <img className='thumbnail' src={`http://88.200.63.148:12345${project.thumbnail}`} alt={project.title} />
                                    <div className="card-container">
                                        <p><strong>Category:</strong> {project.category}</p>
                                        <p><strong>Difficulty:</strong> {project.difficulty}</p>
                                        <p><strong>Time:</strong> {project.time_requied} min</p>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {showReportModal && (
                <div className="modal-overlay">
                    <div className="modal" ref={reportRef}>
                        <h2>Report Project</h2>
                        <label>Type:</label>
                        <select
                            value={reportData.type}
                            onChange={e => setReportData({ ...reportData, type: e.target.value })}
                        >
                            <option value="Spam">Spam</option>
                            <option value="Inappropriate content">Inappropriate content</option>
                            <option value="Harassment or bullying">Harassment or bullying</option>
                            <option value="False information">False information</option>
                            <option value="Copyright violation">Copyright violation</option>
                            <option value="Hate speech">Hate speech</option>
                            <option value="Sexually explicit content">Sexually explicit content</option>
                            <option value="Violence or threats">Violence or threats</option>
                            <option value="Other">Other</option>
                        </select>

                        <label>Reason:</label>
                        <textarea
                            value={reportData.reason}
                            onChange={e => setReportData({ ...reportData, reason: e.target.value })}
                            rows={4}
                        />

                        <div className="modal-actions">
                            <button onClick={() => setShowReportModal(false)}>Cancel</button>
                            <button onClick={handleReportSubmit}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </Container>
    );
};

export default ProjectList;