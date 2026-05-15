import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, deleteProject, reportProject } from '../api/api';
import CommentList from '../component/commentList';
import Container from '../component/container';
import { useAuth } from '../context/AuthContext';  // <-- Import useAuth
import './css/project.css';

const Project = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();  // <-- Dohvati korisnika iz konteksta

  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState({ type: 'Spam', reason: '' });
  const reportRef = useRef();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProjectById(id);
        setProject(data.project);
        setMaterials(data.materials);
        setImages(data.images);
      } catch (err) {
        console.error('Failed to load project', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // Definicija prava pristupa
  const isOwner = user && project && user.user_id === project.user_id;
  const isAdmin = user && user.roles?.some(role => role.name === 'admin');
  const canEditOrDelete = isAdmin || isOwner;
  const canReport = !!user;

  const handleDelete = async () => {
    try {
      await deleteProject(id);
      navigate('/');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleReportSubmit = async () => {
    try {
      await reportProject({ project_id: id, ...reportData });
      setShowReportModal(false);
      setReportData({ type: 'Spam', reason: '' });
    } catch (err) {
      console.error('Report failed:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showReportModal && reportRef.current && !reportRef.current.contains(event.target)) {
        setShowReportModal(false);
        setReportData({ type: 'Spam', reason: '' });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReportModal]);

  if (loading) return <p>Loading project...</p>;
  if (!project) return <p>Project not found</p>;

  return (
    <Container>
      <div className="project-page">
        <div className="project-banner">
          <div className="banner-image-wrapper">
            <img
              src={`http://88.200.63.148:12345${project.thumbnail}`}
              alt={project.title}
              className="banner-image"
            />
          </div>
          <h2 className="banner-title">{project.title}</h2>

          {/* Prikaz dugmadi prema pravima pristupa */}
          <div style={{ marginTop: 10, display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {canEditOrDelete && (
              <>
                <button
                  onClick={() => navigate(`/edit/${id}`)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgb(35 124 0)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgb(219 0 0)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </>
            )}
            {canReport && (
              <button
                onClick={() => setShowReportModal(true)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#0a7cff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Report
              </button>
            )}
          </div>
        </div>

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
                <button
                  onClick={handleReportSubmit}
                  disabled={!reportData.reason.trim()}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="project-tags">
          <span className="project-tag">{project.category}</span>
          <span className="project-tag">{project.difficulty}</span>
          <span className="project-tag">{project.time_requied} min</span>
        </div>

        <div className="project-description-section">
          <h3>Description</h3>
          <p>{project.description}</p>
        </div>

        <div className="project-instruction-section">
          <h3>Instructions</h3>
          <p>{project.instruction}</p>
        </div>

        <div className="project-materials">
          <h3>Materials</h3>
          <ul>
            {materials.map((mat) => (
              <li key={mat.material_id} className="material-item">
                <img src={`http://88.200.63.148:12345${mat.icon}`} alt={mat.name} />
                <div className="material-details">
                  <p>
                    <strong>{mat.name}</strong> ({mat.quantity} {mat.unit})
                  </p>
                  <p>{mat.description}</p>
                  <p>Eco-friendly: {mat.is_ecologically ? 'Yes' : 'No'}</p>
                  <p>Sensitive: {mat.is_sensitive ? 'Yes' : 'No'}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="project-gallery">
          <h3>Project Images</h3>
          <div className="gallery-slider">
            {images.map((img, i) => (
              <img key={i} src={`http://88.200.63.148:12345${img}`} alt={`Project img ${i + 1}`} />
            ))}
          </div>
        </div>

        <div className="comments-section">
          <CommentList projectId={id} />
        </div>
      </div>
    </Container>
  );
};

export default Project;