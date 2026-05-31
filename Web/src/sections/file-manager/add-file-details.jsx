import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';

import { toast } from 'src/components/snackbar';

import { useTranslation } from 'react-i18next';

import DialogContent from '@mui/material/DialogContent';
import { Form } from 'src/components/hook-form';

import { useForm } from 'react-hook-form';
import { task_variant } from 'src/sections/kanban/kanban-mock-data';
import { MenuItem } from '@mui/material';

import { getProjects } from 'src/actions/project/projectActions';
import { getClients, getLeads } from 'src/actions/client/clientActions';
import { getVendors, getContracts } from 'src/actions/vendor/vendorActions';

// ----------------------------------------------------------------------

export function AddFileDetails({
  open,
  onClose,
  handleClose,
  mode,
  addNewDetails,
  variant,
  setVariant,
  projectName,
  setProjectName,
  missionName,
  setMissionsName,
  businessLead,
  setBusinessLead,
  clientName,
  setClientName,
  vendorName,
  setVendorName,
  contract,
  setContract,
  isSubTask,
  isProject,
  setProjectParentFolderId,
  projectParentFolderId,
  clientParentFolderId,
  setClientParentFolderId,
  leadParentFolderId,
  setLeadParentFolderId,
  vendorParentFolderId,
  setVendorParentFolderId,
  contractParentFolderId,
  setContractParentFolderId,

  ...other
}) {
  const { t, i18n } = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');

  const handleCloseDetailsDialog = () => {
    handleClose();
  };

  const { projectList } = getProjects();
  const { clientList, clientListEmpty } = getClients();
  const { leadList, leadListEmpty } = getLeads(clientName || null);
  const { contractList, contractListEmpty } = getContracts(vendorName || null);

  const { vendorList, vendorListEmpty } = getVendors();

  const methods = useForm({
    mode: 'onSubmit',
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      toast.success(currentUser ? t('tasks.toast.delete_sucess') : t('tasks.toast.create_success'));
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });
  const handleAddDetail = () => {
    let projectRootFolderId = null;
    let clientRootFolderId = null;

    let leadRootFolderId = null;

    let vendorRootFolderId = null;

    let contractRootFolderId = null;

    if ((variant === 'Project' || variant === 'Mission') && projectName && projectList?.projects) {
      const selectedProject = projectList.projects.find((p) => p.id === projectName);
      if (selectedProject) {
        projectRootFolderId = selectedProject.rootFolderId;
        setProjectParentFolderId(projectRootFolderId);
      }
    }

    if (variant === 'Client' && clientName && clientList?.clients && !businessLead) {
      const selectedClient = clientList?.clients.find((c) => c.id === clientName);
      if (selectedClient) {
        clientRootFolderId = selectedClient.rootFolderId;
        setClientParentFolderId(clientRootFolderId);
      }
    }

    if (variant === 'Client' && clientName && leadList.leads && businessLead) {
      const selectedLead = leadList.leads.find((l) => l.id === businessLead);
      if (selectedLead) {
        leadRootFolderId = selectedLead.rootFolderId;
        setLeadParentFolderId(leadRootFolderId);
      }
    }

    if (variant === 'Vendor' && vendorName && vendorList?.vendors && !contract) {
      const selectedVendor = vendorList?.vendors.find((v) => v.id === vendorName);
      if (selectedVendor) {
        vendorRootFolderId = selectedVendor.rootFolderId;
        setVendorParentFolderId(vendorRootFolderId);
      }
    }

    if (variant === 'Vendor' && vendorName && contractList.contracts && contract) {
      const selectedContract = contractList.contracts.find((v) => v.id === contract);
      if (selectedContract) {
        contractRootFolderId = selectedContract.rootFolderId;
        setContractParentFolderId(contractRootFolderId);
      }
    }

    const detail = {
      variant: variant,
      projectName: projectName,
      clientName: clientName,
      vendorName: vendorName,
      businessLead: businessLead,
      missionName: missionName,
      contract: contract,
      projectParentFolderId: projectRootFolderId,
      clientParentFolderId: clientRootFolderId,
      vendorParentFolderId: vendorRootFolderId,
      leadParentFolderId: leadRootFolderId,
      contractParentFolderId: contractRootFolderId,
    };
    console.log('this is the details', detail);
    addNewDetails(detail);
    handleCloseDetailsDialog();
  };

  const handleVariantChange = (event) => {
    setVariant(event.target.value);
  };

  const handleProjectNameChange = (event) => {
    setProjectName(event.target.value);
  };

  const handleClientChange = (event) => {
    setClientName(event.target.value);
  };
  const handleVendorNameChange = (event) => {
    setVendorName(event.target.value);
  };

  const handleMissionChange = (event) => {
    setMissionsName(event.target.value);
  };

  const handleBusinessLeadChange = (event) => {
    setBusinessLead(event.target.value);
  };
  const handleContractChange = (event) => {
    setContract(event.target.value);
  };

  return (
    <>
      <Form methods={methods} onSubmit={onSubmit}>
        <Dialog
          fullWidth
          maxWidth="md"
          open={open}
          onClose={handleCloseDetailsDialog}
          dir={storedLang === 'ar' ? 'rtl' : 'ltr'}
          {...other}
        >
          <DialogTitle>{t('tasks.add_filedetails')}</DialogTitle>
          <DialogContent>
            {' '}
            <Box display="flex" justifyContent="center" gap={1}>
              {' '}
              <TextField
                select
                fullWidth
                label={t('tasks.task_type')}
                sx={{ mt: 1 }}
                value={variant}
                onChange={handleVariantChange}
                // disabled={mode === 'edit' || isSubTask}
              >
                {task_variant?.map((type) => (
                  <MenuItem key={type.id} value={type.name}>
                    {type.name}
                  </MenuItem>
                ))}
              </TextField>
              {variant === 'Project' && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.projects')}
                  sx={{ mt: 1 }}
                  value={projectName}
                  onChange={handleProjectNameChange}
                  // disabled={mode === 'edit' || isSubTask}
                >
                  {projectList?.projects.filter((project) => project.type === 1).length ===
                  0 ? (
                    <MenuItem value="">{t('tasks.no_projects')}</MenuItem>
                  ) : (
                    projectList?.projects
                      .filter((project) => project.type === 1)
                      .map((project) => (
                        <MenuItem key={project.id} value={project.id}>
                          {project.name}
                        </MenuItem>
                      ))
                  )}
                </TextField>
              )}
              {variant === 'Mission' && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.mission')}
                  sx={{ mt: 1 }}
                  value={missionName}
                  onChange={handleMissionChange}
                  // disabled={mode === 'edit' || isSubTask}
                >
                  {projectList?.projects.filter((project) => project.type === 0).length ===
                  0 ? (
                    <MenuItem value="">{t('tasks.no_missions')}</MenuItem>
                  ) : (
                    projectList?.projects
                      .filter((project) => project.type === 0)
                      .map((project) => (
                        <MenuItem key={project.id} value={project.id}>
                          {project.name}
                        </MenuItem>
                      ))
                  )}
                </TextField>
              )}
              {variant === 'Client' && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.client')}
                  sx={{ mt: 1 }}
                  value={clientName}
                  onChange={handleClientChange}
                  // disabled={mode === 'edit' || isSubTask}
                >
                  {clientListEmpty ? (
                    <MenuItem value="">{t('tasks.no_clients')}</MenuItem>
                  ) : (
                    clientList?.clients.map((client) => (
                      <MenuItem key={client.id} value={client.id}>
                        {client.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
              {variant === 'Vendor' && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.vendor')}
                  sx={{ mt: 1 }}
                  value={vendorName}
                  onChange={handleVendorNameChange}
                  // disabled={mode === 'edit' || isSubTask}
                >
                  {vendorListEmpty ? (
                    <MenuItem value="">{t('tasks.no_vendors')}</MenuItem>
                  ) : (
                    vendorList?.vendors.map((vendor) => (
                      <MenuItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
            </Box>
            <Box display="flex" justifyContent="center" gap={1} sx={{ mt: 2 }}>
              {' '}
              {variant === 'Client' && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.lead')}
                  sx={{ mt: 1 }}
                  value={businessLead}
                  onChange={handleBusinessLeadChange}
                  // disabled={mode === 'edit' || isSubTask}
                >
                  {leadListEmpty ? (
                    <MenuItem value="">{t('tasks.no_leads')}</MenuItem>
                  ) : (
                    [
                      <MenuItem key="none-lead" value="">
                        <em>{t('tasks.none')}</em>
                      </MenuItem>,
                      ...leadList.leads.map((lead) => (
                        <MenuItem key={lead.id} value={lead.id}>
                          {lead.name}
                        </MenuItem>
                      )),
                    ]
                  )}
                </TextField>
              )}
              {variant === 'Vendor' && (
                <TextField
                  select
                  fullWidth
                  label={t('tasks.contract')}
                  sx={{ mt: 1 }}
                  value={contract}
                  onChange={handleContractChange}
                  // disabled={mode === 'edit' || isSubTask}
                >
                  {contractListEmpty ? (
                    <MenuItem value="">{t('tasks.no_contracts')}</MenuItem>
                  ) : (
                    [
                      <MenuItem key="none-contract" value="">
                        <em>{t('tasks.none')}</em>
                      </MenuItem>,
                      ...contractList.contracts.map((contract) => (
                        <MenuItem key={contract.id} value={contract.id}>
                          {contract.name}
                        </MenuItem>
                      )),
                    ]
                  )}
                </TextField>
              )}
            </Box>
          </DialogContent>

          <DialogActions>
            <Button
              variant="contained"
              onClick={handleCloseDetailsDialog}
              sx={{
                ...(storedLang === 'ar' && { ml: 1 }),
              }}
            >
              {t('tasks.todo.cancel')}
            </Button>
            <Button variant="contained" onClick={handleAddDetail}>
              {t('tasks.add')}
            </Button>
          </DialogActions>
        </Dialog>
      </Form>
    </>
  );
}
