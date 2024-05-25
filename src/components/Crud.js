import React, { useState, useEffect, Fragment } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import axios from 'axios';
import { FaFileExcel } from "react-icons/fa";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as XLSX from 'xlsx';

export const Crud = () => {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const rowsPerPage = 5;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isActive, setIsActive] = useState(0);

  const [editID, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editIsActive, setEditIsActive] = useState(0);

  useEffect(() => {
    getData();
  }, []);

  const handleEdit = (id) => {
    handleShow();
    axios.get(`https://localhost:7197/api/Employee/${id}`)
      .then((result) => {
        const data = result.data;
        setEditName(data.name);
        setEditAge(data.age);
        setEditIsActive(data.isactive);
        setEditId(data.id);
      })
      .catch((error) => {
        console.error('Error fetching employee data:', error);
      });
  };

  const handleUpdate = () => {
    const url = `https://localhost:7197/api/Employee/${editID}`;
    const data = {
      id: editID,
      name: editName,
      age: editAge,
      isactive: editIsActive,
    };

    axios.put(url, data)
      .then((result) => {
        handleClose();
        toast.success("Employee Updated Successfully");
        getData();
      })
      .catch((error) => {
        toast.error("Error updating employee. Please try again later.");
        console.error("Error updating employee:", error);
      });
  };

  const getData = () => {
    axios.get('https://localhost:7197/api/Employee')
      .then((result) => {
        setData(result.data);
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const handleDelete = (id) => {
    if (window.confirm("Do you want to delete this employee?")) {
      axios.delete(`https://localhost:7197/api/Employee?id=${id}`)
        .then(response => {
          if (response.status === 200) {
            toast.success("Deleted data Successfully");
            getData();
          }
        })
        .catch(error => {
          toast.error('Error deleting employee. Please try again later.');
          console.error('Error deleting employee:', error);
        });
    }
  };

  const handleSave = () => {
    const url = 'https://localhost:7197/api/Employee';
    const data = {
      "name": name,
      "age": age,
      "isactive": isActive
    };

    axios.post(url, data)
      .then((result) => {
        getData();
        clear();
        toast.success("Employer Added successfully");
      }).catch((error) => (
        toast.error(error)
      ));
  };

  const clear = () => {
    setName('');
    setAge('');
    setIsActive('');
    setEditName('');
    setEditAge('');
    setEditIsActive(0);
    setEditId('');
  };

  const handleActiveChange = (e) => {
    setIsActive(e.target.checked ? 1 : 0);
  };

  const handleEditActiveChange = (e) => {
    setEditIsActive(e.target.checked ? 1 : 0);
  };

  const filteredData = data.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleExport = (employee) => {
    const ws = XLSX.utils.json_to_sheet([employee]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employee");
    XLSX.writeFile(wb, "employee.xlsx");
  };

  return (
    <Fragment>
      <ToastContainer />
      <Container className='mt-2'>
        <Row>
          <Col>
            <input
              type='text'
              className='form-control'
              placeholder='Search by name'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
        </Row>
      </Container>
      <Container className='mt-2'>
        <Row>
          <Col>
            <input type='text' className='form-control' placeholder='Enter Your Name'
              value={name} onChange={(e) => setName(e.target.value)}
            />
          </Col>
          <Col>
            <input type='text' className='form-control' placeholder='Enter Your Age'
              value={age} onChange={(e) => setAge(e.target.value)}
            />
          </Col>
          <Col>
            <input type='checkbox'
              checked={isActive === 1}
              onChange={handleActiveChange} value={isActive}
            />
            <label>IsActive</label>
          </Col>
          <Col>
            <button className='btn btn-primary' onClick={handleSave}>Submit</button>
          </Col>
        </Row>
      </Container>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>ID</th>
            <th>Name</th>
            <th>Age</th>
            <th>IsActive</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ?
            currentData.map((employee, index) => (
              <tr key={employee.id}>
                <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                <td>{employee.id}</td>
                <td>{employee.name}</td>
                <td>{employee.age}</td>
                <td>{employee.isActive}</td>
                <td colSpan={2}>
                  <button className='btn btn-primary m-1' onClick={() => handleEdit(employee.id)}>Edit</button>
                  <button className='btn btn-danger' onClick={() => handleDelete(employee.id)}>Delete</button>
                  <Button variant="success" style={{marginLeft:'5px'}} onClick={() => handleExport(employee)}>
                    <FaFileExcel />
                  </Button>
                </td>
              </tr>
            ))
            :
            <tr>
              <td colSpan="6">Loading...</td>
            </tr>
          }
        </tbody>
      </Table>
      <div className="d-flex justify-content-between">
        <Button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</Button>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit/Update Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col>
                <input type='text' className='form-control' placeholder='Enter Your Name'
                  value={editName} onChange={(e) => setEditName(e.target.value)}
                />
              </Col>
              <Col>
                <input type='text' className='form-control' placeholder='Enter Your Age'
                  value={editAge} onChange={(e) => setEditAge(e.target.value)}
                />
              </Col>
              <Col>
                <input type='checkbox'
                  checked={editIsActive === 1}
                  onChange={handleEditActiveChange} value={editIsActive}
                />
                <label>IsActive</label>
              </Col>
            </Row>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};
