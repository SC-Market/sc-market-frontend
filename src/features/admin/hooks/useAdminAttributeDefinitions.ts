import { useState, useCallback, useMemo } from "react"
import {
  useGetAttributeDefinitionsQuery,
  useCreateAttributeDefinitionMutation,
  useUpdateAttributeDefinitionMutation,
  useDeleteAttributeDefinitionMutation,
} from "../../../store/api/attributes"
import type {
  AttributeDefinition,
  CreateAttributeDefinitionPayload,
  UpdateAttributeDefinitionPayload,
} from "../../../store/api/attributes"
import { useAlertHook } from "../../../hooks/alert/AlertHook"
import { useTranslation } from "react-i18next"

const INITIAL_FORM: CreateAttributeDefinitionPayload = {
  attribute_name: "", display_name: "", attribute_type: "select",
  allowed_values: null, applicable_item_types: null, display_order: 0, show_in_filters: false,
}

function parseAllowedValues(input: string): string[] | null {
  if (!input.trim()) return null
  return input.split(",").map((v) => v.trim()).filter((v) => v.length > 0)
}

export function useAdminAttributeDefinitions() {
  const { t } = useTranslation()
  const issueAlert = useAlertHook()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDefinition, setSelectedDefinition] = useState<AttributeDefinition | null>(null)

  const { data: definitionsData, isLoading, error } = useGetAttributeDefinitionsQuery({ include_hidden: true })
  const [createDefinition, { isLoading: isCreating }] = useCreateAttributeDefinitionMutation()
  const [updateDefinition, { isLoading: isUpdating }] = useUpdateAttributeDefinitionMutation()
  const [deleteDefinition, { isLoading: isDeleting }] = useDeleteAttributeDefinitionMutation()

  const [formData, setFormData] = useState<CreateAttributeDefinitionPayload>({ ...INITIAL_FORM })
  const [allowedValuesInput, setAllowedValuesInput] = useState("")
  const [cascadeDelete, setCascadeDelete] = useState(false)

  const resetForm = useCallback(() => {
    setFormData({ ...INITIAL_FORM }); setAllowedValuesInput(""); setCascadeDelete(false)
  }, [])

  const handleOpenCreateModal = useCallback(() => { resetForm(); setIsCreateModalOpen(true) }, [resetForm])

  const handleOpenEditModal = useCallback((definition: AttributeDefinition) => {
    setSelectedDefinition(definition)
    setFormData({
      attribute_name: definition.attribute_name, display_name: definition.display_name,
      attribute_type: definition.attribute_type, allowed_values: definition.allowed_values,
      applicable_item_types: definition.applicable_item_types, display_order: definition.display_order,
      show_in_filters: definition.show_in_filters,
    })
    setAllowedValuesInput(definition.allowed_values ? definition.allowed_values.join(", ") : "")
    setIsEditModalOpen(true)
  }, [])

  const handleOpenDeleteModal = useCallback((definition: AttributeDefinition) => {
    setSelectedDefinition(definition); setCascadeDelete(false); setIsDeleteModalOpen(true)
  }, [])

  const handleCloseModals = useCallback(() => {
    setIsCreateModalOpen(false); setIsEditModalOpen(false); setIsDeleteModalOpen(false)
    setSelectedDefinition(null); resetForm()
  }, [resetForm])

  const handleCreateDefinition = useCallback(() => {
    createDefinition({ ...formData, allowed_values: parseAllowedValues(allowedValuesInput) }).unwrap()
      .then(() => { issueAlert({ message: t("admin.attributes.created", "Attribute definition created successfully"), severity: "success" }); handleCloseModals() })
      .catch((err: any) => issueAlert(err))
  }, [formData, allowedValuesInput, createDefinition, issueAlert, handleCloseModals, t])

  const handleUpdateDefinition = useCallback(() => {
    if (!selectedDefinition) return
    const payload: UpdateAttributeDefinitionPayload = {
      display_name: formData.display_name, attribute_type: formData.attribute_type,
      allowed_values: parseAllowedValues(allowedValuesInput),
      applicable_item_types: formData.applicable_item_types, display_order: formData.display_order,
    }
    updateDefinition({ name: selectedDefinition.attribute_name, data: payload }).unwrap()
      .then(() => { issueAlert({ message: t("admin.attributes.updated", "Attribute definition updated successfully"), severity: "success" }); handleCloseModals() })
      .catch((err: any) => issueAlert(err))
  }, [selectedDefinition, formData, allowedValuesInput, updateDefinition, issueAlert, handleCloseModals, t])

  const handleDeleteDefinition = useCallback(() => {
    if (!selectedDefinition) return
    deleteDefinition({ name: selectedDefinition.attribute_name, cascade: cascadeDelete }).unwrap()
      .then(() => { issueAlert({ message: t("admin.attributes.deleted", "Attribute definition deleted successfully"), severity: "success" }); handleCloseModals() })
      .catch((err: any) => issueAlert(err))
  }, [selectedDefinition, cascadeDelete, deleteDefinition, issueAlert, handleCloseModals, t])

  const rows = useMemo(() => {
    if (!definitionsData?.definitions) return []
    return definitionsData.definitions.map((def: AttributeDefinition) => ({ ...def, id: def.attribute_name }))
  }, [definitionsData?.definitions])

  return {
    definitionsData, isLoading, error, rows,
    selectedDefinition,
    isCreateModalOpen, isEditModalOpen, isDeleteModalOpen,
    handleOpenCreateModal, handleOpenEditModal, handleOpenDeleteModal, handleCloseModals,
    formData, setFormData,
    allowedValuesInput, setAllowedValuesInput,
    cascadeDelete, setCascadeDelete,
    isCreating, isUpdating, isDeleting,
    handleCreateDefinition, handleUpdateDefinition, handleDeleteDefinition,
  }
}
