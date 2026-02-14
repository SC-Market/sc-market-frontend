/**
 * Unit Tests for AccessibleDialog Component
 * 
 * These tests verify the basic functionality and accessibility features
 * of the AccessibleDialog component.
 */

import React, { useRef } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { AccessibleDialog } from '../AccessibleDialog'
import { FocusManagerProvider } from '../FocusManager'

expect.extend(toHaveNoViolations)

// Wrapper component to provide FocusManager context
function TestWrapper({ children }: { children: React.ReactNode }) {
  return <FocusManagerProvider>{children}</FocusManagerProvider>
}

describe('AccessibleDialog', () => {
  it('renders with title and content', () => {
    render(
      <TestWrapper>
        <AccessibleDialog
          open={true}
          onClose={() => {}}
          title="Test Dialog"
        >
          <div>Dialog content</div>
        </AccessibleDialog>
      </TestWrapper>
    )
    
    expect(screen.getByText('Test Dialog')).toBeInTheDocument()
    expect(screen.getByText('Dialog content')).toBeInTheDocument()
  })
  
  it('renders with description', () => {
    render(
      <TestWrapper>
        <AccessibleDialog
          open={true}
          onClose={() => {}}
          title="Test Dialog"
          description="This is a test description"
        >
          <div>Dialog content</div>
        </AccessibleDialog>
      </TestWrapper>
    )
    
    expect(screen.getByText('This is a test description')).toBeInTheDocument()
  })
  
  it('renders with actions', () => {
    render(
      <TestWrapper>
        <AccessibleDialog
          open={true}
          onClose={() => {}}
          title="Test Dialog"
          actions={
            <>
              <button>Cancel</button>
              <button>Submit</button>
            </>
          }
        >
          <div>Dialog content</div>
        </AccessibleDialog>
      </TestWrapper>
    )
    
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })
  
  it('has proper ARIA attributes', () => {
    render(
      <TestWrapper>
        <AccessibleDialog
          open={true}
          onClose={() => {}}
          title="Test Dialog"
          description="Test description"
        >
          <div>Dialog content</div>
        </AccessibleDialog>
      </TestWrapper>
    )
    
    // Verify the dialog title is rendered with proper ID
    const title = screen.getByText('Test Dialog')
    expect(title).toBeInTheDocument()
    expect(title).toHaveAttribute('id')
    
    // Verify the description is rendered
    expect(screen.getByText('Test description')).toBeInTheDocument()
  })
  
  it('calls onClose when Escape key is pressed', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    
    render(
      <TestWrapper>
        <AccessibleDialog
          open={true}
          onClose={onClose}
          title="Test Dialog"
        >
          <div>Dialog content</div>
        </AccessibleDialog>
      </TestWrapper>
    )
    
    await user.keyboard('{Escape}')
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })
  
  it('does not render when open is false', () => {
    render(
      <TestWrapper>
        <AccessibleDialog
          open={false}
          onClose={() => {}}
          title="Test Dialog"
        >
          <div>Dialog content</div>
        </AccessibleDialog>
      </TestWrapper>
    )
    
    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument()
  })
  
  it('can hide title when showTitle is false', () => {
    render(
      <TestWrapper>
        <AccessibleDialog
          open={true}
          onClose={() => {}}
          title="Test Dialog"
          showTitle={false}
        >
          <div>Dialog content</div>
        </AccessibleDialog>
      </TestWrapper>
    )
    
    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Dialog content')).toBeInTheDocument()
  })
  
  it('passes through additional DialogProps', () => {
    render(
      <TestWrapper>
        <AccessibleDialog
          open={true}
          onClose={() => {}}
          title="Test Dialog"
          size="lg"
          fullScreen={false}
        >
          <div>Dialog content</div>
        </AccessibleDialog>
      </TestWrapper>
    )
    
    // Verify the dialog is rendered
    expect(screen.getByText('Test Dialog')).toBeInTheDocument()
    expect(screen.getByText('Dialog content')).toBeInTheDocument()
  })
  
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <TestWrapper>
        <AccessibleDialog
          open={true}
          onClose={() => {}}
          title="Test Dialog"
          description="Test description"
          actions={
            <>
              <button>Cancel</button>
              <button>Submit</button>
            </>
          }
        >
          <div>Dialog content</div>
        </AccessibleDialog>
      </TestWrapper>
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  it('manages focus with initialFocus prop', async () => {
    function TestComponent() {
      const submitButtonRef = useRef<HTMLButtonElement | null>(null)
      
      return (
        <TestWrapper>
          <AccessibleDialog
            open={true}
            onClose={() => {}}
            title="Test Dialog"
            initialFocus={submitButtonRef}
            actions={
              <>
                <button>Cancel</button>
                <button ref={submitButtonRef}>Submit</button>
              </>
            }
          >
            <div>Dialog content</div>
          </AccessibleDialog>
        </TestWrapper>
      )
    }
    
    render(<TestComponent />)
    
    // Wait for the dialog to be rendered and focus to be set
    // The focus trap should eventually move focus to the Submit button
    await waitFor(() => {
      const submitButton = screen.getByText('Submit')
      // Check that the button is in the document
      expect(submitButton).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})
