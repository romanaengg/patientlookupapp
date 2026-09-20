package com.testing.patientlookup.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.testing.patientlookup.model.Patient;
import com.testing.patientlookup.repository.PatientRepository;
import com.testing.patientlookup.service.PatientService;

@Service
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    public PatientServiceImpl(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    public String createPatient(Patient patient) {
        patientRepository.save(patient);
        return "Patient created successfully.";
    }

    @Override
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @Override
    public List<Patient> getPatientByFname(String firstName) {
        return patientRepository.findByFirstNameIgnoreCase(firstName);
    }

    @Override
    public Patient getPatientById(Long patientId) {
        return patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found with ID: " + patientId));
    }

    @Override
    public String updatePatient(Long patientId, Patient patient) {

        // Find the existing database record
        Patient existingPatient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found with ID: " + patientId));

        // Update the existing record's fields
        existingPatient.setFirstName(patient.getFirstName());
        existingPatient.setLastName(patient.getLastName());
        existingPatient.setDateOfBirth(patient.getDateOfBirth());
        existingPatient.setGender(patient.getGender());
        existingPatient.setCity(patient.getCity());
        existingPatient.setUpdatedAt(LocalDateTime.now());
        
    

        // Save the existing entity
        patientRepository.save(existingPatient);

        return "Patient updated successfully.";
    }

    @Override
    public String deletePatient(Long patientId) {

        patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found with ID: " + patientId));

        patientRepository.deleteById(patientId);

        return "Patient deleted successfully.";
    }
}