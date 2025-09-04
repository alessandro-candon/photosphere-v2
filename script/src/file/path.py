from pathlib import Path


class PhotospherePath:

    def __init__(self, path: Path | str = None):
        self.path = Path(path) if isinstance(path, str) else path

    def get_string(self) -> str:
        return str(self.path)

    def join(self, *args) -> 'PhotospherePath':
        """Join additional path components to the current path."""
        new_path = self.path.joinpath(*args)
        return PhotospherePath(new_path)

    def get_basename(self):
        """Get the base name of the path."""
        return self.path.name

    def exists(self):
        """Check if the path exists."""
        return self.path.exists()

    def is_allowed_extension(self, allowed_extensions: set[str]) -> bool:
        """Check if the file has an allowed extension."""
        return self.path.suffix.lower() in allowed_extensions

    def is_empty(self):
        """Check if the path is empty (for directories) or if the file size is zero."""
        if self.path.is_dir():
            return not any(self.path.iterdir())
        elif self.path.is_file():
            return self.path.stat().st_size == 0
        return False

    def remove(self):
        """Remove the file or directory at the path."""
        if self.path.is_dir():
            for child in self.path.iterdir():
                if child.is_file():
                    child.unlink()
                else:
                    PhotospherePath(child).remove()
            self.path.rmdir()
        elif self.path.is_file():
            self.path.unlink()