import React from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertTitle, Button, Box } from '@mui/material';

class FormErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Form Error Boundary Caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
          <Alert severity="error">
            <AlertTitle>Something went wrong</AlertTitle>
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
            <Box mt={2}>
              <Button variant="contained" color="primary" onClick={this.handleReset}>
                Try Again
              </Button>
            </Box>
          </Alert>
        </Box>
      );
    }

    return this.props.children;
  }
}

FormErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default FormErrorBoundary;
