<script setup lang="ts">
import { Button } from '@/components/ui/button';
import type { ButtonVariants } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type Props = {
    title: string;
    description?: string;
    submitLabel?: string;
    submitVariant?: NonNullable<ButtonVariants['variant']>;
    processing?: boolean;
    processingLabel?: string;
};

withDefaults(defineProps<Props>(), {
    description: undefined,
    submitLabel: 'Save',
    submitVariant: 'default',
    processing: false,
    processingLabel: 'Saving...',
});

const open = defineModel<boolean>('open', { required: true });

const emit = defineEmits<{
    submit: [];
}>();
</script>

<template>
    <Dialog v-model:open="open">
        <DialogTrigger v-if="$slots.trigger" as-child>
            <slot name="trigger" />
        </DialogTrigger>
        <DialogContent class="max-h-[85vh] overflow-y-auto sm:max-w-[425px]">
            <form class="min-w-0" @submit.prevent="emit('submit')">
                <DialogHeader>
                    <DialogTitle>{{ title }}</DialogTitle>
                    <DialogDescription v-if="description">
                        {{ description }}
                    </DialogDescription>
                </DialogHeader>
                <div v-if="$slots.default" class="mb-4 grid min-w-0 gap-4">
                    <slot />
                </div>
                <DialogFooter>
                    <DialogClose as-child>
                        <Button
                            variant="outline"
                            type="button"
                            class="cursor-pointer"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        type="submit"
                        :variant="submitVariant"
                        :disabled="processing"
                        class="cursor-pointer"
                    >
                        {{ processing ? processingLabel : submitLabel }}
                    </Button>
                    <slot name="actions" />
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
</template>
