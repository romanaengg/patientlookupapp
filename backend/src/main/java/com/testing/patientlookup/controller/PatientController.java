package com.testing.patientlookup.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.testing.patientlookup.model.Patient;
import com.testing.patientlookup.service.PatientService;

@RestController
@RequestMapping("/api/patients")

public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    // GET all patients
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public List<Patient> getAllPatients() {
        return patientService.getAllPatients();
    }

    // GET patient by ID
    @GetMapping("/{patientId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public Patient getPatientById(
            @PathVariable("patientId") Long patientId) {

        return patientService.getPatientById(patientId);
    }

    // ADD patient
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public String createPatient(@RequestBody Patient patient) {

        patientService.createPatient(patient);
        return "Patient added successfully";
    }

    // UPDATE patient
    @PutMapping("/{patientId}")
    @PreAuthorize("hasRole('ADMIN')")
    public String updatePatient(
            @PathVariable("patientId") Long patientId,
            @RequestBody Patient patient) {

        patientService.updatePatient(patientId, patient);
        return "Patient updated successfully";
    }

    // DELETE patient
    @DeleteMapping("/{patientId}")
    @PreAuthorize("hasRole('ADMIN')")
    public String deletePatient(
            @PathVariable("patientId") Long patientId) {

        patientService.deletePatient(patientId);
        return "Patient deleted successfully";
    }
}