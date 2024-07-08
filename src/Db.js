// set up
import Dexie from 'dexie';

const db = new Dexie('qc');
const complianceDB = new Dexie('compliance');
const attachmentsDB = new Dexie('attachmentsDB');
const mqcDB = new Dexie('mqcDB');

db.version(3).stores({
  MqcInspection: `++id,Id,Guid,General,Header,Contents,PreProduction,Packing,Measurement,IsEditing,NewData,PackingAndLabel`,
  Enums: `++id,Name,Elements`,
  EnumDefect: `++id,Active,Code,DefectAreas,Id,Name,NameVi,Remark,RemarkVi,SortOrder`,
  Factories: `++id,Id,Factory`,
  SubFactories: `++id,FactoryId,SubFactory`,
  Customers: `++id,Id,Customer`,
  FactoryLines: `++id,Id,Name,FactoryId`,
  SettingList: `++id,Id,LevelCodeId,AQLLevelMajorId,AQLLevelMinorId,QuantityFrom,QuantityTo,SampleSize,A065,A10,A15,A25,A40,A65,A100`,
});


// Aug-17-2023 update factory info to Todo OBJ - version 4
complianceDB.version(7).stores({
  Todo: `id,Grade,TimeEffect,AuditingResultId,AuditingResult,Remark,AuditDateFrom,AuditDateTo,AuditTypeId,AuditType,AuditTimeId,AuditingCompanyId,AuditingCompanyName,ComplianceInspectionTemplateId,ComplianceInspectionTemplateSysNo,SysNo,CustomerId,CustomerName,FactoryId,FactoryName,BrandId,Brand,AuditorId,AuditorName,CurrentEmplId,WFStatusName,Lines,FactoryInfoLines,PLQualityComplianceLineId,PLQualityComplianceLineSysNo,SubFactoryId,SubFactoryName,DivisionId,DivisionName`,
  Enums: `++id,Name,Elements`,
  Factories: `++id,Id,Factory`,
  SubFactories: `++id,FactoryId,SubFactory`,
  Customers: `++id,Id,Customer`,
  Companies: `++id,Id,CompanyName`,
  Employee: `++id,Id,FirstName,KnowAs,LastName,FullName,GroupName,GroupId`,
  Attachments: `++id,Action,Data,Guid,Id,InternalURL,Name,RecordGuid,Remark,Title,URL`,
});

attachmentsDB.version(6).stores({
  compliance: `id,Guid,Title,Name,URL,Remark,InternalURL,RecordGuid,Data,Action,ParentId`,
  mqc: `id,Guid,Title,Name,URL,Remark,InternalURL,ParentGuid,Data,Action,ParentId,ImageForEntity`,
  qc: `Id,Action,Active,Data,Description,FileName,ParentGuid,SortOrder,Guid,MasterId`,
});


mqcDB.version(2).stores({
  Enums: `++id,Name,Elements`,
  ToDo: `++id,Guid,IsDeleted,SysNo,AuditingResultId,AuditorId,AuditorName,isChanged,ClothContentId,ColorId,CustomerId,CustomerName,FactoryId,FactoryName,ItemCode,ItemId,ItemName,MQCInspectionTemplateId,MQCInspectionTemplateSysNo,PlanningLineId,PlanningLineName,POMaterialLineId,POMaterialLineSysNo,Quantity,MaterialInvoiceNo,QIMaterialFabricLines,
    Remark,SaleOrderId,SaleOrderSysNo,SizeWidthLengthId,StyleCode,StyleId,StyleName,SubFactoryId,SubFactoryName,UnitId,CreatedBy,CreatedDate,LastModifiedBy,LastModifiedDate,TotalQuantity,IsFinished,TotalPenaltyQuantity,TotalPoint,RollQuantity,ItemTypeId,POMaterialPIId,POMaterialPIName,SupplierId,SupplierName, MQCTypeName,Color,AuditingResult`
});

// const extendSchema = async () => {
//   db.close();
//   db.version(Math.round(window.MCIndexDB.version)).stores(window.MCIndexDB.structure);
//   return db.open();
// };

// const extendSchemaCompliance = async () => {
//   complianceDB.close();
//   complianceDB.version(Math.round(window.ComplianceIndexDB.version)).stores(window.ComplianceIndexDB.structure);
//   return complianceDB.open();
// };

// const extendSchemaMqc = async () => {
//   mqcDB.close();
//   mqcDB.version(Math.round(window.MqcIndexDB.version)).stores(window.MqcIndexDB.structure);
//   return mqcDB.open();
// };

// const extendSchemaAttachment = async () => {
//   attachmentsDB.close();
//   attachmentsDB.version(Math.round(window.AttachmentIndexDB.version)).stores(window.AttachmentIndexDB.structure);
//   return attachmentsDB.open();
// };

// extendSchema();
// extendSchemaCompliance();
// extendSchemaMqc();
// extendSchemaAttachment();

export { db, complianceDB, attachmentsDB, mqcDB };
