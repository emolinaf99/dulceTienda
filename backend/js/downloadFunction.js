import ExcelJS from 'exceljs';

// dataDB son los datos ya obtenidos de la BD (array de objetos)
// nameDownload es el nombre que va a tener la hoja y el archivo de descarga
// columns son las columnas del archivo ['columna1','columna2']
// rowsData son los campos que van a llenar cada columna ['campo1','campo2']
// cellValueExtractor es una funcion que determina como se van a establecer los campos segun su tipo (date, nombres, anidaciones)

export async function downloadFunction(dataDB, nameDownload, columns, rowsData, cellValueExtractor) { // <-- Nuevo parámetro: cellValueExtractor
    try {
        // Validaciones
        if (columns.length !== rowsData.length) {
            throw new Error('columns y rowsData deben tener la misma cantidad de elementos');
        }

        if (!dataDB || dataDB.length === 0) {
            throw new Error('No hay datos para exportar');
        }

        // Validación adicional para cellValueExtractor
        if (typeof cellValueExtractor !== 'function') {
            throw new Error('cellValueExtractor debe ser una función.');
        }

        // Preparar nombre del archivo
        const date = new Date();
        const fechaDia = String(date.getUTCDate()).padStart(2, '0');
        const fechaMes = String(date.getUTCMonth() + 1).padStart(2, '0');
        const fechaAño = date.getUTCFullYear();

        const nameDownloadWOWhiteSpaces = nameDownload.replace(/\s/g, '');
        const fileName = `${nameDownloadWOWhiteSpaces}_${fechaDia}_${fechaMes}_${fechaAño}.xlsx`;

        console.log(`Iniciando generación de Excel: ${fileName}`);

        const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
            filename: fileName,
            useStyles: false,
            useSharedStrings: false
        });
        
        const worksheet = workbook.addWorksheet(nameDownload);
        
        worksheet.addRow(columns).commit();
        
        let totalRows = 0;
        
        for (const row of dataDB) {
            // Usar el cellValueExtractor proporcionado
            const rowData = rowsData.map(fieldName => cellValueExtractor(row, fieldName)); // <-- Uso del nuevo parámetro
            
            worksheet.addRow(rowData).commit();
            totalRows++;
            
            if (totalRows % 1000 === 0) {
                if (global.gc) global.gc();
                console.log(`Procesadas ${totalRows} filas...`);
            }
        }
        
        await worksheet.commit();
        await workbook.commit();
        
        console.log(`Excel generado exitosamente: ${fileName} con ${totalRows} filas`);
        return fileName;
        
    } catch (error) {
        console.error('Error generando Excel:', error);
        throw error;
    }
}