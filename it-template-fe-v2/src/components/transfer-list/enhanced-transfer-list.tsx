import { useEffect, useState } from 'react';
// @mui
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Unstable_Grid2';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
// components
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

function not(a: string[], b: string[]) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a: string[], b: string[]) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a: string[], b: string[]) {
  return [...a, ...not(b, a)];
}

type Props = {
  items: string[];
  onListChange: (selectedItems: string[]) => void;
};

export default function EnhancedTransferList({ items, onListChange }: Props) {
  const [checked, setChecked] = useState<string[]>([]);

  const [left, setLeft] = useState<string[]>(items);

  const [right, setRight] = useState<string[]>([]);

  useEffect(() => {
    if (onListChange) {
      onListChange(right);
    }
  }, [right, onListChange]);

  const leftChecked = intersection(checked, left);

  const rightChecked = intersection(checked, right);

  const handleToggle = (value: string) => () => {
    const currentIndex = checked.indexOf(value);

    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const numberOfChecked = (list: string[]) => intersection(checked, list).length;

  const handleToggleAll = (list: string[]) => () => {
    if (numberOfChecked(list) === list.length) {
      setChecked(not(checked, list));
    } else {
      setChecked(union(checked, list));
    }
  };

  const handleCheckedRight = () => {
    setRight(right.concat(leftChecked));
    setLeft(not(left, leftChecked));
    setChecked(not(checked, leftChecked));
  };

  const handleCheckedLeft = () => {
    setLeft(left.concat(rightChecked));
    setRight(not(right, rightChecked));
    setChecked(not(checked, rightChecked));
  };

  const customList = (title: React.ReactNode, listItems: string[]) => (
    <Card sx={{ borderRadius: 1.5 }}>
      <CardHeader
        avatar={
          <Checkbox
            onClick={handleToggleAll(listItems)}
            checked={numberOfChecked(listItems) === listItems.length && listItems.length !== 0}
            indeterminate={
              numberOfChecked(listItems) !== listItems.length && numberOfChecked(listItems) !== 0
            }
            disabled={listItems.length === 0}
            inputProps={{ 'aria-label': 'all items selected' }}
          />
        }
        title={title}
        subheader={`${numberOfChecked(listItems)}/${listItems.length} selected`}
        sx={{ p: 2 }}
      />

      <Divider />

      <List
        dense
        component="div"
        role="list"
        sx={{
          width: 200,
          height: 220,
          overflow: 'auto',
        }}
      >
        {listItems.map((value: string) => {
          const labelId = `transfer-list-all-item-${value}-label`;
          return (
            <ListItemButton key={value} role="listitem" onClick={handleToggle(value)}>
              <ListItemIcon>
                <Checkbox
                  disableRipple
                  checked={checked.indexOf(value) !== -1}
                  tabIndex={-1}
                  inputProps={{ 'aria-labelledby': labelId }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value} />
            </ListItemButton>
          );
        })}
      </List>
    </Card>
  );

  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ width: 'auto', p: 3 }}>
      <Grid>{customList('Choices', left)}</Grid>

      <Grid container direction="column" alignItems="center" sx={{ p: 3 }}>
        <Button
          color="inherit"
          variant="outlined"
          size="small"
          onClick={handleCheckedRight}
          disabled={leftChecked.length === 0}
          aria-label="move selected right"
          sx={{ my: 1 }}
        >
          <Iconify icon="eva:arrow-ios-forward-fill" width={18} />
        </Button>

        <Button
          color="inherit"
          variant="outlined"
          size="small"
          onClick={handleCheckedLeft}
          disabled={rightChecked.length === 0}
          aria-label="move selected left"
          sx={{ my: 1 }}
        >
          <Iconify icon="eva:arrow-ios-back-fill" width={18} />
        </Button>
      </Grid>

      <Grid>{customList('Chosen', right)}</Grid>
    </Grid>
  );
}
