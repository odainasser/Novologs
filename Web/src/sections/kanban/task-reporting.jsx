'use client';
import { useState, useRef } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Typography, Button, Menu, MenuItem, Stack } from '@mui/material';

import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { DashboardContent } from 'src/layouts/dashboard';
import { TaskReportingPieChart } from './task-reporting-pie-chart';
import { TaskReportingBarChart } from './task-reporting-bar-chart';

import { CATEGORIES, MOCK_EMPLOYEE_TASKS } from 'src/sections/kanban/kanban-mock-data';
import { useTranslation } from 'react-i18next';


// Export libs
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { tasks } from 'src/theme/core';

export function TaskReporting() {
  const{t,i18n} = useTranslation('dashboard/tasks');
  const storedLang = localStorage.getItem('selectedLang');
  const isArabic = i18n.language === 'ar';

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const prepareExportData = () =>
    MOCK_EMPLOYEE_TASKS.map((emp) => ({
      Employee: emp.employeeName,
      'Not started': emp.stats.notStarted,
      'In progress': emp.stats.inProgress,
      'On hold': emp.stats.onHold,
      Submitted: emp.stats.submitted,
      Completed: emp.stats.completed,
    }));

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(prepareExportData());
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, t("tasks.Task_Report"));
    XLSX.writeFile(workbook, 'task-report.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.text(t("tasks.Task_Report"), 14, 16);

    autoTable(doc, {
      startY: 22,
      head: [[t('tasks.Employee'), t('tasks.kanban_details.Not started'), t('tasks.kanban_details.in_progress'), t('tasks.kanban_details.on_hold'), t('tasks.kanban_details.submitted'), t('tasks.kanban_details.completed')]],
      body: prepareExportData().map((row) => Object.values(row)),
    });

    doc.save('task-report.pdf');
  };

  const chartRef = useRef(null);

  const exportChartsToPDF = async () => {
    if (!chartRef.current) return;

    const canvas = await html2canvas(chartRef.current, {
      scale: 2, // better quality
      useCORS: true,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
    pdf.save('task-report-charts.pdf');
  };

  return (
    <>
      {/* Header row */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3, mt: 1.5 }}
      >
        <Typography variant="h4">{t('tasks.task_reporting')}</Typography>

        <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleOpenMenu}>
          {t('tasks.export')}
        </Button>

        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
          <MenuItem
            onClick={() => {
              exportToExcel();
              handleCloseMenu();
            }}
          >
            {t('tasks.export_as_excel')}
          </MenuItem>

          <MenuItem
            onClick={() => {
              exportChartsToPDF();
              handleCloseMenu();
            }}
          >
            {t('tasks.Exportpdf')}
          </MenuItem>
        </Menu>
      </Stack>

      {/* Employee charts */}
       <div ref={chartRef}>
      {MOCK_EMPLOYEE_TASKS.map((employee) => {
        const dataValues = [
          employee.stats.notStarted,
          employee.stats.inProgress,
          employee.stats.onHold,
          employee.stats.submitted,
          employee.stats.completed,
        ];

        return (
          <Grid container spacing={1} key={employee.employeeId} sx={{ mb: 6 }}>
            <Grid xs={12}>
              <Typography variant="h5">{employee.employeeName}</Typography>
            </Grid>

            <Grid xs={12} md={6} lg={4}>
              <TaskReportingPieChart
                title={t("tasks.heading")}
                chart={{
                  series: CATEGORIES.map((label, index) => ({
                    label,
                    value: dataValues[index],
                  })).filter((item) => item.value > 0),
                }}
              />
            </Grid>

            <Grid xs={12} md={6} lg={8}>
              <TaskReportingBarChart
                title={t("tasks.heading")}
                chart={{
                  categories: CATEGORIES,
                  series: [{ data: dataValues }],
                }}
              />
            </Grid>
          </Grid>
        );
      })}
      </div>
    </>
  );
}
