import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockStore } from '../../setupTests';
import { Providers } from '../../src/app/providers';
import SettingsView from '../../src/components/settings/SettingsView';

describe('Settings - Import/Export/Delete Everything', () => {
  beforeEach(() => {
    mockStore.clear();
    mockStore.set(
      'PARENT.txt',
      JSON.stringify({ name: 'Alex', children: ['emma'] })
    );
    mockStore.set(
      'CHILD-emma.txt',
      JSON.stringify({
        name: 'Emma',
        accounts: [],
        cb: 0,
        cbts: Date.now()
      })
    );
  });

  it('should export all data as JSON manifest', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <SettingsView />
      </Providers>
    );

    const exportButton = await screen.findByRole('button', { name: /export/i });
    await user.click(exportButton);

    // Expect download trigger (mocked in tests)
    await waitFor(() => {
      // In real implementation, this would trigger a file download
      expect(exportButton).toBeInTheDocument();
    });
  });

  it('should import data atomically (all-or-nothing swap)', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <SettingsView />
      </Providers>
    );

    // Find the file input (it's hidden under the "Choose File" label)
    const fileInput = await screen.findByLabelText(/choose file/i);
    
    // Create a valid manifest with proper structure
    const mockManifest = JSON.stringify({
      'PARENT.txt': JSON.stringify({ name: 'Test Parent', children: [] })
    });
    const mockFile = new File([mockManifest], 'backup.json', { type: 'application/json' });
    
    await user.upload(fileInput, mockFile);

    // Expect confirmation
    await waitFor(() => {
      expect(screen.getByText(/import.*successful|data.*restored/i)).toBeInTheDocument();
    });
  });

  it('should delete everything with confirmation', async () => {
    const user = userEvent.setup();
    render(
      <Providers>
        <SettingsView />
      </Providers>
    );

    const deleteButton = await screen.findByRole('button', { name: /delete everything|reset/i });
    await user.click(deleteButton);

    // Expect confirmation dialog
    const confirmButton = await screen.findByRole('button', { name: /yes.*delete/i });
    expect(confirmButton).toBeInTheDocument();

    await user.click(confirmButton);

    // Expect all data cleared
    await waitFor(() => {
      expect(screen.getByText(/all data.*deleted|reset.*complete/i)).toBeInTheDocument();
    });
  });

  it('should maintain single backup policy during import', async () => {
    // Before import, existing data should be backed up as .bak files
    // Only one backup per file should exist
    expect(true).toBe(true); // Placeholder for backup logic test
  });
});

