import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  RefreshCw,
  LogIn,
  LogOut
} from 'lucide-react';

import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = 'http://localhost:8080/api/patients';

export default function App() {

  // -----------------------------
  // Authentication
  // -----------------------------
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState('');
  const [loginError, setLoginError] = useState('');

  // -----------------------------
  // Application state
  // -----------------------------
  const [view, setView] = useState('list');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // -----------------------------
  // Form state
  // -----------------------------
  const emptyForm = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    city: ''
  };

  const [formData, setFormData] = useState(emptyForm);
  const [editingPatientId, setEditingPatientId] = useState(null);

  // -----------------------------
  // Authentication header
  // -----------------------------
  const getAuthHeader = () => {
    return 'Basic ' + btoa(`${username}:${password}`);
  };

  // -----------------------------
  // Login
  // -----------------------------
  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginError('');
    setLoading(true);

    try {

      // Test authentication by requesting patient list
      const response = await fetch(API_BASE_URL, {
        method: 'GET',
        headers: {
          'Authorization': getAuthHeader()
        }
      });

      if (response.status === 401) {
        throw new Error('Invalid username or password.');
      }

      if (!response.ok) {
        throw new Error('Unable to connect to the backend.');
      }

     
      if (username === 'patientadmin') {
        setRole('ADMIN');
      } else {
        setRole('USER');
      }

      setLoggedIn(true);

    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Logout
  // -----------------------------
  const handleLogout = () => {
    setUsername('');
    setPassword('');
    setLoggedIn(false);
    setRole('');
    setPatients([]);
    setSelectedPatient(null);
    setView('list');
  };

  // -----------------------------
  // Fetch all patients
  // -----------------------------
  const fetchPatients = async () => {

    setLoading(true);
    setError('');

    try {

      const response = await fetch(API_BASE_URL, {
        headers: {
          'Authorization': getAuthHeader()
        }
      });

      if (response.status === 401) {
        throw new Error('Authentication failed.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch patients.');
      }

      const data = await response.json();
      setPatients(data);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
// -----------------------------
  // Fetch individual patient by first name
  // -----------------------------
  const [searchName, setSearchName] = useState('');
const searchPatients =async () => {
  if(!searchName.trim()) {
    fetchPatients();
    return;
  }
  
  setLoading(true);
  setError('');
  try {
    const response = await fetch(`${API_BASE_URL}/search?firstName=${encodeURIComponent(searchName)}`, {
      headers: {
        'Authorization': getAuthHeader()
      }
    });

    if (!response.ok) {
      throw new Error('Failed to search patients.');
    }
    
    const data = await response.json();
    setPatients(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  // -----------------------------
  // Fetch individual patient by ID
  // -----------------------------
  const viewPatientDetails = async (id) => {

    setLoading(true);
    setError('');

    try {

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        headers: {
          'Authorization': getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error('Patient record could not be retrieved.');
      }

      const data = await response.json();

      setSelectedPatient(data);
      setView('details');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Input changes
  // -----------------------------
  const handleInputChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  // -----------------------------
  // Create patient
  // -----------------------------
 const handleCreatePatient = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader()
      },
      body: JSON.stringify(formData)
    });

    const responseText = await response.text();

    console.log('POST status:', response.status);
    console.log('POST response:', responseText);

    if (!response.ok) {
      throw new Error(
        `Unable to add patient (${response.status}): ${responseText}`
      );
    }

    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: '',
      city: ''
    });

    setView('list');

  } catch (err) {
    console.error('Create patient error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  // -----------------------------
  // Load patient into edit form
  // -----------------------------
  const startEditPatient = async (id) => {

    setLoading(true);
    setError('');

    try {

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        headers: {
          'Authorization': getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error('Unable to retrieve patient.');
      }

      const patient = await response.json();

      setFormData({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        dateOfBirth: patient.dateOfBirth || '',
        gender: patient.gender || '',
        city: patient.city || ''
      });

      setEditingPatientId(id);
      setView('edit');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Update patient
  // -----------------------------
  const handleUpdatePatient = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError('');

    try {

      const response = await fetch(
        `${API_BASE_URL}/${editingPatientId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader()
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.status === 403) {
        throw new Error('You do not have permission to update patients.');
      }

      if (!response.ok) {
        throw new Error('Error updating patient.');
      }

      setFormData(emptyForm);
      setEditingPatientId(null);

      await fetchPatients();

      setView('list');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Delete patient
  // -----------------------------
  const handleDeletePatient = async (id) => {

    const confirmed = window.confirm(
      'Are you sure you want to delete this patient?'
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError('');

    try {

      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getAuthHeader()
        }
      });

      if (response.status === 403) {
        throw new Error('You do not have permission to delete patients.');
      }

      if (!response.ok) {
        throw new Error('Error deleting patient.');
      }

      await fetchPatients();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Load patients after login
  // -----------------------------
  useEffect(() => {

    if (loggedIn && view === 'list') {
      fetchPatients();
    }

  }, [loggedIn, view]);

  // =====================================================
  // LOGIN SCREEN
  // =====================================================

  if (!loggedIn) {

    return (
      <div className="container mt-5">

        <div className="row justify-content-center">

          <div className="col-md-5">

            <div className="card shadow">

              <div className="card-header text-center">

                <h3 className="mb-0">
                  🏥 Patient Portal
                </h3>

              </div>

              <div className="card-body">

                <h5 className="text-center mb-4">
                  Sign In
                </h5>

                {loginError && (
                  <div className="alert alert-danger">
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin}>

                  <div className="mb-3">

                    <label className="form-label">
                      Username
                    </label>

                    <input
                      type="text"
                      className="form-control"
                      value={username}
                      onChange={(e) =>
                        setUsername(e.target.value)
                      }
                      required
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label">
                      Password
                    </label>

                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                    />

                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading}
                  >

                    <LogIn size={16} className="me-2" />

                    {loading ? 'Signing in...' : 'Sign In'}

                  </button>

                </form>

                <hr />

                
              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN APPLICATION
  // =====================================================

  return (

    <div className="container mt-4 mb-5">

      {/* Header */}

      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">

        <div>

          <h2 className="mb-1">
            🏥 Patient Portal
          </h2>

          <span className="badge bg-secondary">
            {role}
          </span>

        </div>

        <button
          className="btn btn-outline-danger"
          onClick={handleLogout}
        >
          <LogOut size={16} className="me-1" />
          Logout
        </button>

      </div>

      {/* Navigation */}

      <div className="mb-4">

        <button
          className="btn btn-primary me-2"
          onClick={() => setView('list')}
        >
          <Users size={16} className="me-1" />
          Patients
        </button>

        {role === 'ADMIN' && (

          <button
            className="btn btn-success"
            onClick={() => {
              setFormData(emptyForm);
              setEditingPatientId(null);
              setView('create');
            }}
          >
            <UserPlus size={16} className="me-1" />
            Add Patient
          </button>

        )}

      </div>

      {/* Loading */}

      {loading && (

        <div className="alert alert-info">

          <RefreshCw size={16} className="me-2" />

          Communicating with backend...

        </div>

      )}

      {/* Error */}

      {error && (

        <div className="alert alert-danger">

          ⚠️ {error}

        </div>

      )}

    
      {/* =================================================
          PATIENT LIST
          ================================================= */}

      {view === 'list' && !loading && (


        <div>
       {/* Search Bar */ }
      <div className="card  mb-4">  
        <div className="card-body">
          <h5 className="card-title">Search by First Name:</h5>
          <div className ="row g-2">
          <div className="col-md-8">
            <input
              type="text"
              className="form-control"
              placeholder="Enter first name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onkeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  searchPatients();
                }
              }}
            />
          </div>
            
          <div className="col-auto">
            <button
              className="btn btn-outline-primary"
              onClick={searchPatients}
            >
              Search
            </button>
          </div>
        </div>
        </div>
      </div>  

          <div className="d-flex justify-content-between align-items-center mb-3">

            <h3>All Patients</h3>

            <button
              className="btn btn-outline-secondary"
              onClick={fetchPatients}
            >
              <RefreshCw size={16} className="me-1" />
              Refresh
            </button>

          </div>

          {patients.length === 0 ? (

            <div className="alert alert-secondary">
              No patients found.
            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-striped table-hover">

                <thead className="table-dark">

                  <tr>

                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Date of Birth</th>
                    <th>City</th>
                    <th>Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {patients.map((patient) => (

                    <tr key={patient.patientId}>

                      <td>
                        {patient.patientId}
                      </td>

                      <td>
                        {patient.firstName}
                      </td>

                      <td>
                        {patient.lastName}
                      </td>

                      <td>
                        {patient.dateOfBirth}
                      </td>

                      <td>
                        {patient.city || 'N/A'}
                      </td>

                      <td>

                        <button
                          className="btn btn-sm btn-primary me-1"
                          onClick={() =>
                            viewPatientDetails(patient.patientId)
                          }
                        >
                          <Eye size={14} />
                        </button>

                        {role === 'ADMIN' && (

                          <>
                            <button
                              className="btn btn-sm btn-warning me-1"
                              onClick={() =>
                                startEditPatient(
                                  patient.patientId
                                )
                              }
                            >
                              <Edit size={14} />
                            </button>

                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() =>
                                handleDeletePatient(
                                  patient.patientId
                                )
                              }
                            >
                              <Trash2 size={14} />
                            </button>
                          </>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}

      {/* =================================================
          PATIENT DETAILS
          ================================================= */}

      {view === 'details' && selectedPatient && (

        <div className="card shadow-sm">

          <div className="card-body">

            <button
              className="btn btn-outline-secondary mb-3"
              onClick={() => setView('list')}
            >
              <ArrowLeft size={16} className="me-1" />
              Back
            </button>

            <h3>
              Patient Details
            </h3>

            <hr />

            <div className="row">

              <div className="col-md-6 mb-3">
                <strong>Patient ID</strong>
                <div>{selectedPatient.patientId}</div>
              </div>

              <div className="col-md-6 mb-3">
                <strong>First Name</strong>
                <div>{selectedPatient.firstName}</div>
              </div>

              <div className="col-md-6 mb-3">
                <strong>Last Name</strong>
                <div>{selectedPatient.lastName}</div>
              </div>

              <div className="col-md-6 mb-3">
                <strong>Date of Birth</strong>
                <div>{selectedPatient.dateOfBirth}</div>
              </div>

              <div className="col-md-6 mb-3">
                <strong>Gender</strong>
                <div>
                  {selectedPatient.gender || 'Not specified'}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <strong>City</strong>
                <div>
                  {selectedPatient.city || 'Not specified'}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Created At</strong>
                <div>
                  {selectedPatient.createdAt || 'Not specified'}
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <strong>Updated At</strong>
                <div>
                  {selectedPatient.updatedAt || 'Not specified'}
                </div>
              </div>

            </div>

          </div>

        </div>

      )}

      {/* =================================================
          CREATE / EDIT FORM
          ================================================= */}

      {(view === 'create' || view === 'edit') && (

        <div className="card shadow-sm">

          <div className="card-body">

            <button
              className="btn btn-outline-secondary mb-3"
              onClick={() => setView('list')}
            >
              <ArrowLeft size={16} className="me-1" />
              Back
            </button>

            <h3>

              {view === 'create'
                ? 'Add New Patient'
                : 'Edit Patient'}

            </h3>

            <hr />

            <form
              onSubmit={
                view === 'create'
                  ? handleCreatePatient
                  : handleUpdatePatient
              }
            >

              <div className="row">

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    First Name
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    className="form-control"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />

                </div>

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Last Name
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    className="form-control"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />

                </div>

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Date of Birth
                  </label>

                  <input
                    type="date"
                    name="dateOfBirth"
                    className="form-control"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />

                </div>

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    Gender
                  </label>

                  <select
                    name="gender"
                    className="form-select"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >

                    <option value="">
                      Select...
                    </option>

                    <option value="Male">
                      Male
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

                <div className="col-md-6 mb-3">

                  <label className="form-label">
                    City
                  </label>

                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    value={formData.city}
                    onChange={handleInputChange}
                  />

                </div>

              </div>

              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >

                {view === 'create'
                  ? 'Save Patient'
                  : 'Update Patient'}

              </button>

            </form>

          </div>

        </div>

      )}

    </div>

  );
}