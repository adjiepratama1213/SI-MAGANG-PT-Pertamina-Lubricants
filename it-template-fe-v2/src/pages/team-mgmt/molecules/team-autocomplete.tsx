import { Autocomplete, TextField, InputAdornment, Avatar, Typography, Link } from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import Iconify from 'src/components/iconify';
import { ITeamItem } from 'src/types/team';

interface TeamAutocompleteProps {
  filters: { teamId?: string };
  teamIdOptions: ITeamItem[];
  handleFilterTeamId: (teamId: string) => void;
}

export default function TeamAutocomplete({ filters, teamIdOptions, handleFilterTeamId }: TeamAutocompleteProps) {
  return (
    <Autocomplete
      sx={{ width: { xs: '100%', sm: 760 } }}
      autoHighlight
      options={teamIdOptions}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      value={teamIdOptions.find((option) => option.id === filters.teamId) || null}
      onChange={(_, newValue) => handleFilterTeamId(newValue?.id || '')}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search Team..."
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />
      )}
      renderOption={(props, option, { inputValue }) => {
        const matches = match(option.name, inputValue);
        const parts = parse(option.name, matches);

        return (
          <li {...props} key={option.id}>
            <Avatar
              alt={option.name}
              src={option.avatar || ''}
              variant="rounded"
              sx={{ width: 48, height: 48, flexShrink: 0, mr: 1.5, borderRadius: 1 }}
            />
            <Link
              underline="none"
              component="button"
              onClick={() => handleFilterTeamId(option.id)}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {parts.map((part, index) => (
                <Typography
                  key={index}
                  component="span"
                  color={part.highlight ? 'primary' : 'text.primary'}
                  sx={{
                    typography: 'body2',
                    fontWeight: part.highlight ? 'fontWeightSemiBold' : 'fontWeightMedium',
                  }}
                >
                  {part.text}
                </Typography>
              ))}
            </Link>
          </li>
        );
      }}
    />
  );
}
