package com.testing.patientlookup.service;
import java.util.List;

import com.testing.patientlookup.model.Patient;
public interface PatientService {
   public String createPatient(Patient patient);
    public List<Patient> getAllPatients();
    public String getPatientByFname  (String firstName);
   public Patient getPatientById(Long patientId);
   public String updatePatient(Long patientId, Patient patient);
   public String deletePatient(Long patientId);
}