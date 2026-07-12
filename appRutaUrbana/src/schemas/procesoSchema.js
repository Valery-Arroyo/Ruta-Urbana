import * as yup from 'yup';

export const procesoSchema = yup.object().shape({
  OrdenPaso: yup.number().required('El orden es obligatorio').integer().positive(),
  TiempoEstimadoMinutos: yup.number().nullable().min(0, 'No puede ser negativo'),
  IdEstacion: yup.number().required('La estación es obligatoria'),
  IdProducto: yup.number().nullable(),
  IdCombo: yup.number().nullable(),
}).test('exclusivity', 'Debes seleccionar un Producto o un Combo', (values) => {
  return !!values.IdProducto || !!values.IdCombo;
});