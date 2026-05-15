import axios from 'axios';

const API_BASE = 'http://88.200.63.148:12345/api/v1';

export const getSessionUser = async () => {
  const response = await axios.get(`${API_BASE}/user/authentication`, { withCredentials: true });
  return response.data;
};

export const fetchRoles = async () => {
  const res = await axios.get(`${API_BASE}/role`, {
    withCredentials: true,
  });
  return res.data;
};

export const fetchMaterials = async () => {
  const res = await axios.get(`${API_BASE}/material`);
  return res.data.materials;
};

export const addMaterial = async (formData) => {
  const res = await axios.post(`${API_BASE}/material/add`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const getCommentsByProject = async (projectId) => {
  const res = await axios.get(`${API_BASE}/comment/${projectId}`);
  return res.data.comments;
};

export const deleteMaterial = async (materialId) => {
  const res = await axios.delete(`${API_BASE}/material/${materialId}`);
  return res.data;
};

export const deleteProject = async (projectId) => {
  console.log(projectId)
  const res = await axios.delete(`${API_BASE}/project/${projectId}`, {
    withCredentials: true,
  });
  return res.data;
};

export const reportProject = async (reportData) => {
  console.log(reportData)
  const res = await axios.post(`${API_BASE}/report`, reportData, {
    withCredentials: true,
  });
  return res.data;
};

export const updateMaterial = async (materialId, formData) => {
  const res = await axios.put(`${API_BASE}/material/${materialId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const assignRole = async (userId, roleId) => {
  return axios.post(`${API_BASE}/role/assign`, {
    user_id: userId,
    role_id: roleId,
  }, {
    withCredentials: true,
  });
};

export const removeRole = async (userId, roleId) => {
  return axios.delete(`${API_BASE}/role`, {
    data: {
      user_id: userId,
      role_id: roleId,
    },
    withCredentials: true,
  });
};

export const fetchReports = async () => {
  const res = await axios.get(`${API_BASE}/report/`, {
    withCredentials: true
  });
  return res.data;
};

export const updateReportStatus = async (reportId, status) => {
  return axios.put(`${API_BASE}/report/${reportId}/status`, {
    status
  }, {
    withCredentials: true
  });
};


export const searchProjects = async (filters = {}) => {
  const res = await axios.post(`${API_BASE}/project/search`, filters, {
    withCredentials: true,
  });
  return res.data.projects;
};

export const getProjectById = async (id) => {
  const res = await axios.get(`${API_BASE}/project/${id}`, {
    withCredentials: true,
  });
  return res.data;
};

export const registerUser = async ({ username, email, password, file }) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('email', email);
  formData.append('password', password);
  formData.append('file', file);

  const response = await axios.post(`${API_BASE}/user/register`, formData);
  return response.data;
};

export const createProject = async (projectData) => {
  const formData = new FormData();

  formData.append('title', projectData.title);
  formData.append('description', projectData.description);
  formData.append('category', projectData.category);
  formData.append('difficulty', projectData.difficulty);
  formData.append('time_required', projectData.time_required);
  formData.append('is_published', projectData.is_published);
  formData.append('instruction', projectData.instruction);

  formData.append('materials', JSON.stringify(
    projectData.materials.map(({ id, quantity }) => ({ id, quantity }))
  ));

  formData.append('thumbnail', projectData.thumbnail);

  projectData.images.forEach((image) => {
    formData.append('images', image);
  });

  const response = await axios.post(`${API_BASE}/project`, formData, { withCredentials: true });
  return response.data;
};

export const updateProject = async (projectId, projectData) => {
  const formData = new FormData();

  formData.append('title', projectData.title);
  formData.append('description', projectData.description);
  formData.append('category', projectData.category);
  formData.append('difficulty', projectData.difficulty);
  formData.append('time_required', projectData.time_required);
  formData.append('is_published', projectData.is_published);
  formData.append('instruction', projectData.instruction);

  formData.append('materials', JSON.stringify(
    projectData.materials.map(({ id, quantity }) => ({ id, quantity }))
  ));

  if (projectData.thumbnail instanceof File) {
    formData.append('thumbnail', projectData.thumbnail);
  }

  projectData.images.forEach((image) => {
    formData.append('images', image);
  });

  const response = await axios.put(`${API_BASE}/project/${projectId}`, formData, { withCredentials: true });
  return response.data;
};

export const searchMaterials = async (name = '') => {
  try {
    const res = await axios.get(`${API_BASE}/material/search`, {
      params: { name }
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching materials:', error);
    return [];
  }
};

export const loginUser = (credentials) => {
  console.log(credentials)
  return axios.post(`${API_BASE}/user/login`, credentials, { withCredentials: true }
  );
};

export const logoutUser = () => {
  return axios.get(`${API_BASE}/user/logout`, { withCredentials: true });
};

export const createComment = async ({ content, project_id }) => {
  const res = await axios.post(`${API_BASE}/comment`, { content, project_id }, { withCredentials: true });
  return res.data;
};

export const deleteComment = async (id) => {
  await axios.delete(`${API_BASE}/comment/${id}`, { withCredentials: true });
};

export const updateComment = async (id, data) => {
  const res = await axios.put(`${API_BASE}/comment/${id}`, data, { withCredentials: true });
  return res.data;
};