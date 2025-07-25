import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, Loader2, Layers } from "lucide-react"
import { useEditForm } from "@/features/temporalidade/hooks/forms/useEditForm"
import { TemporalidadeForm } from "@/features/temporalidade/components/temporalidade-form"

export default function EditArea() {
  const { id } = useParams()
  
  const {
    register,
    handleSubmit,
    setValue,
    onSubmit,
    isPending,
    isLoading,
    temporalidade
  } = useEditForm(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <>
      <div className="pt-2 pl-4">
        <Link to='/dashboard/areas'>
          <Button variant="link" className="gap-1">
            <ChevronLeftIcon className="opacity-60" size={16} />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center space-x-2">
          <Layers className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-medium">Editar Área</h1>
        </div>
        <p className="text-muted-foreground">
          Atualize os dados abaixo para editar a área no sistema
        </p>
      </div>

      <TemporalidadeForm
        register={register}
        handleSubmit={handleSubmit}
        setValue={setValue}
        onSubmit={onSubmit}
        isPending={isPending}
        temporalidade={temporalidade}
        isEdit={true}
      />
    </>
  )
}
