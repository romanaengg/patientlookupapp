package com.testing.patientlookup.repository;
import java.util.List;
     
import org.springframework.data.jpa.repository.JpaRepository;

import com.testing.patientlookup.model.Patient;

public interface PatientRepository extends JpaRepository <Patient, Long> {
   
    List<Patient> findByFirstNameIgnoreCase(String firstName);
}