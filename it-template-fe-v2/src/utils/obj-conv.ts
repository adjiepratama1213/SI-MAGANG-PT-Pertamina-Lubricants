import _ from 'lodash';

export function objValToEmptyString(obj: any) {
  return _.mapValues(obj, (v) => (_.isNull(v) ? '' : v));
}

export function objValToNull(obj: any) {
  return _.mapValues(obj, (v) => (v === '' ? null : v));
}

export function objExclude(obj: any, keys: string[]) {
  keys.forEach(key => {
    delete obj[key];
  });
  return obj;
}
