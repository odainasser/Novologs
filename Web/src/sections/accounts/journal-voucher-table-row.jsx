import { useState } from 'react';

import Button from '@mui/material/Button';

import Tooltip from '@mui/material/Tooltip';

import TableRow from '@mui/material/TableRow';

import TableCell from '@mui/material/TableCell';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { fDate } from 'src/utils/format-time';

import { _status, _projects, _categories, _members } from 'src/sections/kanban/kanban-mock-data';
import { useTranslation } from 'react-i18next';
import { JournalVoucherDetails } from './journal-voucher-details';

// ----------------------------------------------------------------------

export function JournalVoucherTableRow({
  row,
  onEditRow,
  onDeleteRow,
  onPostRow,
  index,

  isPosted,
}) {
  const { t, i18n } = useTranslation('dashboard/accounts');
  const storedLang = localStorage.getItem('selectedLang');
  const entryCount = row?.lines?.length || 0;
  const confirm = useBoolean();
  const post = useBoolean();
  const [openDetails, setOpenDetails] = useState(false);

  const handleRowClick = () => setOpenDetails(true);
  const handleCloseDetails = () => setOpenDetails(false);
  return (
    <>
      {row.lines.map((entry, i) => {
        const isLastEntry = i === entryCount - 1;

        return (
          <TableRow
            key={`${row.referenceNo}-${i}`}
            hover
            sx={{
              cursor: i === 0 ? 'pointer' : 'default',
              '& td': {
                borderTop: i === 0 ? '1px dotted rgba(200, 200, 200, 0.6)' : 'none',
                // borderBottom: isLastEntry ? '1px dotted rgba(145, 158, 171, 0.2)' : 'none',

                backgroundColor: '#fff',
              },
            }}
            onClick={(e) => {
              if (!e.target.closest('button, svg, input')) {
                handleRowClick();
              }
            }}
          >
            {i === 0 && (
              <TableCell
                align="center"
                rowSpan={entryCount}
                sx={{
                  cursor: 'pointer',
                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                  verticalAlign: 'top',
                  pt: 2,
                }}
              >
                {index + 1}
              </TableCell>
            )}

            {i === 0 && (
              <>
                {/* <TableCell
                  rowSpan={entryCount}
                  sx={{
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '200px',
                    borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                    verticalAlign: 'top',
                    pt: 2,
                  }}
                >
                  {fDate(row.createdAt)}
                </TableCell> */}
                <TableCell
                  rowSpan={entryCount}
                  sx={{
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '200px',
                    borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                    verticalAlign: 'top',
                    pt: 2,
                  }}
                >
                  {fDate(row.date)}
                </TableCell>
              </>
            )}

            {i === 0 && (
              <TableCell
                rowSpan={entryCount}
                sx={{
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '200px',
                  borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
                  verticalAlign: 'top',
                  pt: 2,
                }}
              >
                {row.referenceNo || 'Not Available'}
              </TableCell>
            )}

            <TableCell
              sx={{
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '200px',
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
            >
              {entry.accountCode} ({entry.accountName})
            </TableCell>

            <TableCell
              sx={{
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '200px',
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
            >
              {entry.description}
            </TableCell>

            <TableCell
              align="right"
              sx={{
                cursor: 'pointer',
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
            >
              {entry.debit
                ? new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(Number(entry.debit))
                : ''}
            </TableCell>

            <TableCell
              align="right"
              sx={{
                cursor: 'pointer',
                borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
              }}
            >
              {entry.credit
                ? new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(Number(entry.credit))
                : ''}
            </TableCell>

            {!isPosted && i === 0 && (
              <TableCell align="center" rowSpan={entryCount} sx={{ verticalAlign: 'top', pt: 2 }}>
                <Tooltip title={t('accounts.edit')} arrow>
                  <Iconify
                    icon="solar:pen-bold"
                    color="#006A67"
                    sx={{
                      mr: storedLang === 'ar' ? 0 : 1,
                      ml: storedLang === 'ar' ? 1 : 0,
                      cursor: 'pointer',
                    }}
                    width={13}
                    height={13}
                    onClick={() => {
                      onEditRow(row);
                    }}
                  />
                </Tooltip>

                <Tooltip title={t('accounts.post')} arrow>
                  <Iconify
                    icon="mdi:send"
                    color="#006A67"
                    sx={{
                      mr: storedLang === 'ar' ? 0 : 1,
                      ml: storedLang === 'ar' ? 1 : 0,
                      cursor: 'pointer',
                    }}
                    width={13}
                    height={13}
                    onClick={() => {
                      post.onTrue();
                    }}
                  />
                </Tooltip>

                <Tooltip title="Delete">
                  <Iconify
                    icon="solar:trash-bin-trash-bold"
                    color="error.main"
                    sx={{
                      mr: storedLang === 'ar' ? 0 : 1,
                      ml: storedLang === 'ar' ? 1 : 0,
                      cursor: 'pointer',
                    }}
                    width={15}
                    height={15}
                    onClick={() => {
                      confirm.onTrue();
                    }}
                  />
                </Tooltip>
              </TableCell>
            )}
          </TableRow>
        );
      })}
      <TableRow
        sx={{
          '& td': {
            borderBottom: '1px dotted rgba(200, 200, 200, 0.6)',
            backgroundColor: 'rgba(145, 158, 171, 0.04)',
          },
        }}
      >
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell />
        <TableCell
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
          }}
        />
        <TableCell
          align="right"
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          {t('accounts.total')}:{' '}
          {row.totalDebit.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </TableCell>
        <TableCell
          align="right"
          sx={{
            borderRight: '1px dotted rgba(200, 200, 200, 0.6)',
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          {t('accounts.total')}:{' '}
          {row.totalCredit.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </TableCell>
        <TableCell />
      </TableRow>

      <TableRow>
        <TableCell colSpan={8} sx={{ border: 'none', height: 14, p: 0 }} />
      </TableRow>
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete Transaction"
        content="Are you sure you want to delete this transaction?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={onDeleteRow}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            Delete
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
      <ConfirmDialog
        open={post.value}
        onClose={post.onFalse}
        title="Post Transaction"
        content="Are you sure you want to post this transaction?"
        action={
          <Button
            variant="contained"
            onClick={onPostRow}
            sx={{
              ...(storedLang === 'ar' && { ml: 1 }),
            }}
          >
            Post
          </Button>
        }
        sx={{
          direction: storedLang === 'ar' ? 'rtl' : 'ltr',
        }}
      />
      <JournalVoucherDetails open={openDetails} onClose={handleCloseDetails} voucher={row} />
    </>
  );
}
