import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { createAudit } from '../services/audit';

const AUDIT_TYPES = [
  'IT Security',
  'Financial',
  'Compliance',
  'Operational',
  'Quality Assurance',
  'Environmental',
  'Health and Safety',
  'Data Privacy',
  'Risk Management',
  'Internal Control'
];

const INDUSTRIES = [
  'Healthcare',
  'Finance',
  'Manufacturing',
  'Technology',
  'Retail',
  'Education',
  'Government',
  'Energy',
  'Transportation',
  'Construction',
  'Hospitality',
  'Telecommunications'
];

const COMPLEXITY_LEVELS = [
  { value: 'basic', label: 'Basic' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const CreateAuditForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    audit_type: '',
    organization: '',
    industry: '',
    specific_requirements: '',
    complexity_level: 'intermediate'
  });
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await createAudit(formData);
      toast({
        title: 'Audit Created',
        description: 'Your audit has been created successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate(`/audits/${response.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create audit',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="600px" mx="auto" p={6}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter audit title"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Audit Type</FormLabel>
            <Select
              name="audit_type"
              value={formData.audit_type}
              onChange={handleChange}
              placeholder="Select audit type"
            >
              {AUDIT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Organization</FormLabel>
            <Input
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              placeholder="Enter organization name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Industry</FormLabel>
            <Select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="Select industry"
            >
              {INDUSTRIES.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Specific Requirements</FormLabel>
            <Textarea
              name="specific_requirements"
              value={formData.specific_requirements}
              onChange={handleChange}
              placeholder="Enter any specific requirements or focus areas"
              rows={4}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Complexity Level</FormLabel>
            <Select
              name="complexity_level"
              value={formData.complexity_level}
              onChange={handleChange}
            >
              {COMPLEXITY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </Select>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            isLoading={isLoading}
            loadingText="Creating Audit..."
          >
            Create Audit
          </Button>
        </VStack>
      </form>

      {/* Loading Modal */}
      <Modal isOpen={isLoading} onClose={() => {}} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody p={6} textAlign="center">
            <Spinner size="xl" mb={4} />
            <Text fontSize="lg">Generating audit checklist...</Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              This may take a few moments
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CreateAuditForm; 